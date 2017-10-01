/*! RESOURCE: /scripts/app.ng_chat/util/directive.snFocusOnConversation.js */
angular.module('sn.connect.util').directive('snFocusOnConversation', function($timeout, $parse, $window, activeConversation) {
    'use strict';
    return {
        restrict: "A",
        link: function(scope, element, attr) {
            if (attr.disableAutofocus)
                return;
            scope.snFocusOnConversation = $parse(attr.snFocusOnConversation)(scope);
            scope.$watch(function() {
                return activeConversation.conversation;
            }, function(conversation) {
                if (window.getSelection().toString() !== "")
                    return;
                if (!scope.snFocusOnConversation)
                    return;
                if (!conversation)
                    return;
                if (conversation.sysID !== scope.snFocusOnConversation.sysID)
                    return;
                $timeout(function() {
                    focusOnMessageInput();
                });
            });

            function focusOnMessageInput() {
                if ($window.ontouchstart)
                    return;
                $timeout(function() {
                    element.focus();
                });
            }
            focusOnMessageInput();
        }
    }
});;