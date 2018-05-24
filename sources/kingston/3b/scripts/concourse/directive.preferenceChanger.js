/*! RESOURCE: /scripts/concourse/directive.preferenceChanger.js */
angular.module('sn.concourse').directive('preferenceChanger', function(getTemplateUrl, snCustomEvent, userPreferences) {
  "use strict";
  return {
    restrict: 'E',
    scope: {
      label: '@',
      moreinfo: '@',
      type: '@',
      fireEvent: '@',
      preference: '@',
      reload: '@',
      confirm: '@',
      options: '='
    },
    replace: true,
    templateUrl: getTemplateUrl('cc_preference_changer.xml'),
    controller: function($scope, $window, $timeout) {
      $scope.id = (Math.random() * 1000) + $scope.preference.replace(/\./g, '_');
      userPreferences.getPreference($scope.preference).then(function(val) {
        if (val && $scope.type === 'boolean') {
          try {
            $scope.prefValue = JSON.parse(val);
          } catch (e) {
            $scope.prefValue = val;
          }
        } else
          $scope.prefValue = val;
        if (val == "null" && $scope.options) {
          $scope.prefValue = $scope.options[0].value;
        }
        $scope.origValue = $scope.prefValue;
        if ($scope.fireEvent) {
          snCustomEvent.on($scope.fireEvent, function(newVal) {
            if ($scope.prefValue === newVal)
              return;
            $timeout(function() {
              $scope.prefValue = newVal || newVal === "true";
            });
          });
        }
        $scope.$watch('prefValue', function(newValue, oldValue) {
          if (newValue != oldValue) {
            if ($scope.confirm) {
              if (newValue == $scope.origValue)
                return;
              if (!confirm($scope.confirm)) {
                $timeout(function() {
                  $scope.prefValue = $scope.origValue;
                });
                return;
              }
            }
            userPreferences.setPreference($scope.preference, newValue).then(function() {
              if ($scope.reload)
                $window.location.reload();
              if ($scope.fireEvent)
                snCustomEvent.fireAll($scope.fireEvent, newValue);
            });
          }
        });
      });
    },
    link: function($scope, $element) {
      $element.on('change', 'input[type=checkbox]', function() {
        $scope.prefValue = angular.element(this).prop('checked');
        $scope.$apply();
      });
      $element.on('change', 'input[type=radio]', function() {
        $scope.prefValue = this.getAttribute('value');
        $scope.$apply();
      })
    }
  }
});;