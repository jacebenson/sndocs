/*! RESOURCE: /scripts/app.ng_chat/util/directive.snActionsMenu.js */
angular.module("sn.connect.util").directive("snActionsMenu", function(getTemplateUrl) {
  "use strict";
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl("snActionsMenu.xml"),
    scope: {
      conversation: "="
    },
    replace: true,
    link: function(scope, elem) {
      if (elem.hideFix)
        elem.hideFix();
    },
    controller: function($scope, $timeout, $rootScope) {
      $scope.runAction = function($event, chatAction) {
        if (chatAction.isActive) {
          $event.preventDefault();
          $event.stopPropagation();
          return;
        }
        if (chatAction.requiresArgs) {
          $timeout(function() {
            $scope.conversation.chatActions.currentAction = chatAction;
            $scope.$emit("connect.chat_action.require_options", $scope.conversation);
          }, 0, false)
        } else {
          chatAction.trigger($scope.conversation);
        }
      };
      $scope.addAttachment = function() {
        $rootScope.$broadcast("connect.attachment_dialog.open", $scope.conversation.sysID);
      };
      $scope.openDropup = function($event) {
        $event.stopPropagation();
        angular.element($event.target)
          .siblings(".dropdown-menu")
          .dropdown("toggle");
      };
    }
  };
});;