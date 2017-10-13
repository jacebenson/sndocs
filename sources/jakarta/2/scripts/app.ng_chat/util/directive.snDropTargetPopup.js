/*! RESOURCE: /scripts/app.ng_chat/util/directive.snDropTargetPopup.js */
angular.module("sn.connect.util").directive("snDropTargetPopup", function(getTemplateUrl, $window) {
  "use strict";
  return {
    restrict: "E",
    templateUrl: getTemplateUrl('snDropTargetPopup.xml'),
    replace: true,
    scope: {
      conversation: "="
    },
    link: function(scope, element) {
      var messageElement = element.find(".drop-target-message");
      scope.showDropTarget = false;
      scope.$on("connect.drop_target_popup.show", function(e, conversationID) {
        if ($window.navigator.userAgent.indexOf("Firefox") > -1)
          return;
        if (conversationID !== scope.conversation.sysID)
          return;
        scope.showDropTarget = true;
        element.css({
          "z-index": 10
        });
        element.velocity({
          opacity: 1
        }, {
          duration: 300,
          easing: "easeOutCubic"
        });
        messageElement.velocity({
          "padding-top": "0px"
        }, {
          duration: 300,
          easing: "easeOutCubic"
        });
      });
      scope.$on("connect.drop_target_popup.hide", function(e, conversationID) {
        if ($window.navigator.userAgent.indexOf("Firefox") > -1)
          return;
        if (conversationID !== scope.conversation.sysID)
          return;
        element.velocity({
          opacity: 0
        }, {
          duration: 300,
          easing: "easeOutCubic",
          complete: function() {
            scope.showDropTarget = false;
            element.css({
              "z-index": -1
            })
          }
        });
        messageElement.velocity({
          paddingTop: "40px"
        }, {
          duration: 300,
          easing: "easeOutCubic"
        });
      });
    }
  }
});;