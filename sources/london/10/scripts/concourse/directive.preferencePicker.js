/*! RESOURCE: /scripts/concourse/directive.preferencePicker.js */
angular.module('sn.concourse').directive('preferencePicker', ['$http', 'getTemplateUrl', function($http, getTemplateUrl) {
  "use strict";
  return {
    templateUrl: getTemplateUrl('concourse_preference_picker.xml'),
    restrict: 'E',
    scope: {
      current: '=',
      list: '=',
      endpoint: '@',
      reload: '@',
      labelTitle: '@',
      refreshTitle: '@'
    },
    controller: function($scope) {
      $scope.getList = function() {
        $http.get('/api/now/ui/concoursepicker/' + $scope.endpoint).then(function(response) {
          if (response && response.data && response.data.result && response.data.result.list) {
            $scope.list = response.data.result.list;
            if (response.data.result.current) {
              $scope.current = response.data.result.current;
            }
          }
        });
      };
      $scope.refreshPicker = function() {
        $scope.getList();
      };
      $scope.updateCurrent = function() {
        $http.put('/api/now/ui/concoursepicker/' + $scope.endpoint, {
          current: $scope.current
        }).then(function(response) {
          if (response && response.data && response.data.result && response.data.result.success) {
            if ($scope.reload) {
              $scope.reloadPage();
            }
          }
        })
      };
      $scope.reloadPage = function() {
        window.top.location.reload(true);
      };
    }
  }
}]);;