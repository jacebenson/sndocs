/*! RESOURCE: /scripts/app.ng_chat/util/directive.snChatActionOptionsPopup.js */
angular.module('sn.connect.util').directive('snChatActionOptionsPopup', function(getTemplateUrl) {
    "use strict";
    return {
        restrict: 'E',
        templateUrl: getTemplateUrl("snChatActionOptionsPopup.xml"),
        replace: true,
        controller: function($scope, $element, hotKeyHandler, snHotKey, $timeout) {
            $scope.currentAction = {};
            $scope.argString = '';
            $scope.visible = false;
            $scope.isShown = false;
            $scope.input = $element.find('input');
            var closeHotKey = new snHotKey({
                key: "ESC",
                callback: function() {
                    if ($scope.isShown)
                        $scope.close();
                }
            });
            hotKeyHandler.add(closeHotKey);
            $scope.$on("connect.chat_action.require_options", function(e, conversation) {
                if (conversation.sysID !== $scope.conversation.sysID)
                    return;
                $scope.currentAction = conversation.chatActions.currentAction;
                $scope.isShown = true;
                $scope.error = false;
                $timeout(function() {
                    $scope.input.focus();
                }, 0, false);
            });
            $scope.close = function() {
                if (!$scope.isShown)
                    return;
                $scope.currentAction = {};
                $scope.isShown = false;
                $scope.argString = '';
                $scope.error = false;
                $scope.$evalAsync(function() {
                    $scope.$root.$broadcast("connect.message.focus", $scope.conversation);
                });
            };
            $scope.runAction = function() {
                if (!$scope.argString.trim().length) {
                    $timeout(function() {
                        $scope.error = true;
                    });
                    return;
                }
                var queryString = $scope.currentAction.shortcut + " " + $scope.argString;
                $scope.conversation.chatActions.run(queryString);
                $scope.close();
            };
            $scope.input.on("keydown", function(event) {
                if (event.keyCode === 13 && !event.shiftKey) {
                    $scope.runAction();
                }
            });
        }
    };
});;