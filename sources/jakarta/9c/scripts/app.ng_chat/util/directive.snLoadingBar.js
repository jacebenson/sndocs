/*! RESOURCE: /scripts/app.ng_chat/util/directive.snLoadingBar.js */
angular.module('sn.connect.util').directive('snLoadingBar', function() {
  "use strict";
  return {
    restrict: 'E',
    template: "<div class='sn-loading-bar'></div>",
    replace: true,
    link: function(scope, element) {
      scope.$on("connect.loading-bar.start", function() {
        element.velocity({
          width: 90 + "%"
        }, {
          easing: "linear",
          duration: 450
        });
      });
      scope.$on("connect.loading-bar.finish", function() {
        element.velocity({
          width: 100 + "%"
        }, {
          easing: "linear",
          duration: 50
        }).velocity({
          opacity: 0
        }, {
          easing: "linear",
          duration: 300
        }).velocity({
          width: 0,
          opacity: 1
        }, {
          duration: 0
        })
      });
    }
  };
});;