/*! RESOURCE: /scripts/app.ng_chat/message/directive.snAriaChatMessage.js */
angular.module('sn.connect.message').directive('snAriaChatMessage', function(getTemplateUrl, $templateCache, $interpolate, $sanitize) {
  'use strict';
  var ariaTemplate = $templateCache.get(getTemplateUrl('snAriaChatMessage.xml'));
  return {
    restrict: 'E',
    replace: true,
    template: "<div></div>",
    scope: {
      message: '='
    },
    link: function(scope, element) {
      var node = $interpolate(ariaTemplate)(scope);
      element.html($sanitize(node));
    },
    controller: function($scope) {
      $scope.displayedText = function() {
        if (!$scope.message.isMessageShowing) {
          return "";
        }
        return $scope.message.displayText;
      };
      $scope.attachmentMessage = function() {
        if (!$scope.message.attachments || !$scope.message.attachments.length) {
          return "";
        }
        var output = "";
        for (var i = 0, len = $scope.message.attachments.length; i < len; i++) {
          var attachment = $scope.message.attachments[i];
          output += i > 0 ? ' . ' : '';
          output += attachment.fileName + ', ' + attachment.byteDisplay;
        }
        return output;
      }
    }
  }
});;