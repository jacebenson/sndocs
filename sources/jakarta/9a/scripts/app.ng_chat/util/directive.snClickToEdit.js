/*! RESOURCE: /scripts/app.ng_chat/util/directive.snClickToEdit.js */
angular.module('sn.connect.util').directive('snClickToEdit', function($timeout, getTemplateUrl) {
  "use strict";
  return {
    restrict: 'E',
    scope: {
      currText: "=text",
      onSaveText: "&onsavetext",
      canEdit: "=condition"
    },
    transclude: true,
    templateUrl: getTemplateUrl("snClickToEdit.xml"),
    replace: true,
    controller: function($scope) {
      $scope.editingText = false;
      $scope.inputClick = function($event) {
        $event.stopPropagation();
        if (!$scope.canEdit) return;
        $scope.editingText = true;
        $scope.prevText = $scope.currText;
      }
      $scope.saveText = function() {
        if (!$scope.editingText || ($scope.prevText === $scope.currText) || !$scope.canEdit) {
          $scope.editingText = false
          return;
        }
        $scope.editingText = false;
        if ($scope.onSaveText) $scope.onSaveText({
          text: $scope.currText
        });
      }
      $scope.cancelEdit = function() {
        $scope.editingText = false;
        $scope.currText = $scope.prevText;
      }
    }
  }
});;