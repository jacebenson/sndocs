/*! RESOURCE: /scripts/app.embedded_help/directive.embeddedHelpBarToggle.js */
angular.module('sn.embedded_help').directive('embeddedHelpBarToggle', ['getTemplateUrl',
  function(getTemplateUrl) {
    "use strict";
    return {
      templateUrl: getTemplateUrl('embedded_help_bar_toggle.xml'),
      restrict: 'E',
      replace: true,
      scope: {
        state: '&'
      },
      controller: ['$scope', 'snCustomEvent', 'paneManager', function($scope, snCustomEvent, paneManager) {
        $scope.state = "closed";
        $scope.contentExists = false;
        $scope.toggleHelpPane = function() {
          paneManager.togglePane(EmbeddedHelpEvents.PANE_NAME, true);
        };
        snCustomEvent.observe(EmbeddedHelpEvents.PANE_STATE, function(openState) {
          $scope.state = openState;
        });
        snCustomEvent.observe(EmbeddedHelpEvents.CONTENT_LOAD, function(contentExists) {
          $scope.contentExists = contentExists;
        });
      }],
      link: function(scope, element) {
        scope.$on('help_pane.collapsed', function($event, position, isCollapsed, autoFocus) {
          if (isCollapsed && autoFocus) {
            element.focus();
          }
        });
      }
    }
  }
]);;