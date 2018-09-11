/*! RESOURCE: /scripts/app.ng_chat/util/directive.snOnload.js */
angular.module('sn.connect.util').directive('snOnload', function() {
  return {
    scope: {
      callBack: '&snOnload'
    },
    link: function(scope, element) {
      element.on('load', function() {
        scope.callBack();
        scope.$apply();
      });
    }
  };
});;