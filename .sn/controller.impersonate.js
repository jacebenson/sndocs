/*! RESOURCE: /scripts/concourse/controller.impersonate.js */
angular.module('sn.concourse').controller('Impersonate', function($scope, $http, $log, $window, userPreferences, snCustomEvent) {
    "use strict";
    $scope.searchConfig = {
        field: {
            value: null,
            displayValue: null,
            attributes: 'ref_ac_columns_search=true,ref_ac_columns=name;sys_id;user_name'
        },
        additionalDisplayColumns: 'user_name',
        disabled: false
    };
    $scope.submitFromReference = function() {
        var user = $scope.searchConfig.field.value;
        $scope.impersonate(user);
    };
    $scope.$on('dialog.impersonate.show', function loadRecents() {
        $scope.show_error = false;
        $http.get('/api/now/ui/impersonate/recent').then(function(response) {
            $scope.recent_impersonations = response.data.result;
        });
    });
    snCustomEvent.observe('sn:impersonate', function(user_name) {
        $scope.impersonate(user_name);
    });
    $scope.impersonate = function(user_name) {
        if (!user_name)
            return;
        $http.post('/api/now/ui/impersonate/' + user_name, {}).success(function() {
            $scope.show_error = false;
            window.location = "/";
        }).error(function(response) {
            if (response.error) {
                $scope.show_error = true;
                $scope.error = response.error;
                $log.error("Impersonate failed", response.error);
            }
        });
    };
});;