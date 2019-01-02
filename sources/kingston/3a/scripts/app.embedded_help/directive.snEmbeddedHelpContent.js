/*! RESOURCE: /scripts/app.embedded_help/directive.snEmbeddedHelpContent.js */
angular.module('sn.embedded_help').directive('snEmbeddedHelpContent', function(getTemplateUrl) {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('sn_embedded_help_content.xml'),
    replace: true,
    scope: {
      collapsed: '='
    },
    link: function(scope, element) {
      element.removeClass("loading");
    },
    controller: ['$scope', 'embeddedHelpService', function($scope, embeddedHelpService) {
      $scope.suppressLanguageWarning = {
        suppress: false
      };
      $scope.clicked = false;
      $scope.onConfirmLanguageWarningClick = function() {
        $scope.$emit('language-warning.confirmed', $scope.suppressLanguageWarning.suppress);
      }
      $scope.addHelpArticle = function() {
        window.open(embeddedHelpService.addHelpArticle());
      }
      $scope.click = function() {
        if ($scope.opened)
          angular.element('#embeddedHelpDropdown').blur();
        else
          $scope.opened = true;
      }
      $scope.unclick = function() {
        $scope.opened = false;
      }
    }]
  };
});;