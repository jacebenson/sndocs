/*! RESOURCE: /scripts/app.ng_chat/resource/directive.snAsideInfo.js */
angular.module('sn.connect.resource').directive('snAsideInfo', function(getTemplateUrl, $timeout) {
  'use strict';
  return {
    replace: true,
    restrict: 'E',
    templateUrl: getTemplateUrl('snAsideInfo.xml'),
    link: function(scope, element) {
      scope.$on("sn.aside.open", function() {
        $timeout(function() {
          if (element.is(":visible"))
            scope.$emit("sn.aside.controls.active", "info");
        }, 0, false);
      });
    },
    controller: function($scope) {
      $scope.$emit("sn.aside.controls.active", "info");
      $scope.isFieldVisible = function(field) {
        return field.displayValue && field.type !== 'journal_input' && field.type !== 'journal_list';
      };
      $scope.historyBack = function(evt) {
        if (evt && evt.keyCode === 9)
          return;
        $scope.$emit("sn.aside.historyBack");
      };
    }
  }
});;