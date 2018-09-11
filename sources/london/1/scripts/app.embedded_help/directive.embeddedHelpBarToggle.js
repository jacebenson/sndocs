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
      controller: ['$scope', 'snCustomEvent', 'paneManager', '$timeout', 'userPreferences', function($scope, snCustomEvent, paneManager, $timeout, userPreferences) {
        $scope.state = "closed";
        $scope.contentExists = false;
        $scope.toggleHelpPane = function() {
          paneManager.togglePane(EmbeddedHelpEvents.PANE_NAME, true);
          if ($scope.state === "closed") {
            window.GlideWebAnalytics.trackEvent(WebaEvents.CATEGORY, WebaEvents.HELP_PANE_KEY, WebaEvents.HELP_PANE_VALUE, 0);
          }
        };
        userPreferences.getPreference('glide.ui.accessibility', false).then(function(val) {
          if (!!window.MSInputMethodContext && !!document.documentMode) {
            $scope.useIE11AccessibilitySpecialCase = val === "true" ? true : false;
          }
        });

        function focusInput() {
          var btnToFocus = angular.element("#embeddedHelpDropdown");
          if (btnToFocus.length > 0)
            btnToFocus.focus();
        };
        snCustomEvent.observe(EmbeddedHelpEvents.PANE_STATE, function(openState) {
          $scope.state = openState;
          var $snHelpPane = angular.element('.sn-embedded-help-content');
          if (openState == 'open' && $snHelpPane.length > 0) {
            if ($scope.useIE11AccessibilitySpecialCase) {
              $timeout(function() {
                focusInput();
              }, 425);
            } else {
              $snHelpPane.one('transitionend', function() {
                focusInput();
              });
            }
          }
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