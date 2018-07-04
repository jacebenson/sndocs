/*! RESOURCE: /scripts/app.embedded_help/directive.snEmbeddedHelpActionList.js */
angular.module('sn.embedded_help').directive('snEmbeddedHelpActionList', ['getTemplateUrl',
  function(getTemplateUrl) {
    "use strict";
    return {
      templateUrl: getTemplateUrl('sn_embedded_help_action_list.xml'),
      restrict: 'E',
      replace: true,
      controller: ['$scope', '$rootScope', 'embeddedHelpService', function($scope, $rootScope, embeddedHelpService) {
        $scope.helpEvents = EmbeddedHelpEvents;
        $scope.activeTourSysId = embeddedHelpService.getActiveTourSysId();
        $scope.activeTourName = embeddedHelpService.getActiveTourName();
        $scope.guidedSetupConfig = embeddedHelpService.getGuidedSetupConfig();
        $scope.guidedSetupActions = $scope.guidedSetupConfig ? $scope.guidedSetupConfig.actions : [];
        $scope.isGuidedSetupSticky = isGuidedSetupSticky();
        $scope.getTours = function() {
          return $scope.$parent.tours;
        }
        $scope.startTour = function(tour) {
          if (tour != null) {
            embeddedHelpService.startTour(tour.sysID, tour.name);
            $scope.activeTourName = tour.name;
          }
        }
        $scope.endTour = function() {
          embeddedHelpService.endTour();
        }
        $rootScope.$on(EmbeddedHelpEvents.TOUR_STATE_ID, function(event, activeTourSysId) {
          $scope.activeTourSysId = activeTourSysId;
        });
        $rootScope.$on(EmbeddedHelpEvents.TOUR_STATE_NAME, function(event, activeTourName) {
          $scope.activeTourName = activeTourName;
        });
        $scope.onGuidedSetupActionClick = function(action) {
          embeddedHelpService.handleGuidedSetupAction(action);
        }
        $rootScope.$on(EmbeddedHelpEvents.GUIDED_SETUP_ACTIONS_CHANGE, function(event, newGuidedSetupActions) {
          $scope.guidedSetupActions = newGuidedSetupActions;
          $scope.isGuidedSetupSticky = isGuidedSetupSticky();
        });
        $scope.onActionClick = function(expression) {
          expression = expression.replace(/&quot;/g, '\'');
          return eval(expression);
        }

        function isGuidedSetupSticky() {
          $scope.guidedSetupConfig = embeddedHelpService.getGuidedSetupConfig();
          return !angular.equals({}, $scope.guidedSetupConfig);
        }
      }]
    }
  }
]);;