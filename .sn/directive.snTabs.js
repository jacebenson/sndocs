/*! RESOURCE: /scripts/sn/common/ui/directive.snTabs.js */
angular.module('sn.common.ui').directive('snTabs', function() {
    'use strict';
    return {
        restrict: 'E',
        transclude: true,
        replace: 'true',
        scope: {
            tabData: '='
        },
        link: function($scope, element, attrs) {
            $scope.tabClass = attrs.tabClass;
            $scope.register = attrs.register;
            attrs.$observe('register', function(value) {
                $scope.register = value;
                $scope.setupListeners();
            });
            $scope.bounceTab = function() {
                angular.element()
            }
        },
        controller: 'snTabs'
    }
}).controller('snTabs', function($scope, $rootScope) {
    $scope.selectedTabIndex = 0;
    $scope.tabData[$scope.selectedTabIndex].selected = true;
    $scope.setupListeners = function() {
        $scope.$on($scope.register + '.selectTabByIndex', function(event, index) {
            $scope.selectTabByIndex(event, index);
        });
    }
    $scope.selectTabByIndex = function(event, index) {
        if (index === $scope.selectedTabIndex)
            return;
        if (event.stopPropagation)
            event.stopPropagation();
        $scope.tabData[$scope.selectedTabIndex].selected = false;
        $scope.tabData[index].selected = true;
        $scope.selectedTabIndex = index;
        $rootScope.$broadcast($scope.register + '.selectTabByIndex', $scope.selectedTabIndex);
    }
}).directive('snTab', function() {
    'use strict';
    return {
        restrict: 'E',
        transclude: true,
        replace: 'true',
        scope: {
            tabData: '=',
            index: '='
        },
        template: '',
        controller: 'snTab',
        link: function($scope, element, attrs) {
            $scope.register = attrs.register;
            attrs.$observe('register', function(value) {
                $scope.register = value;
                $scope.setupListeners();
            });
            $scope.bounceTab = function() {
                alert('Bounce Tab at Index: ' + $scope.index);
            }
        }
    }
}).controller('snTab', function($scope) {
    $scope.selectTabByIndex = function(index) {
        $scope.$emit($scope.register + '.selectTabByIndex', index);
    }
    $scope.setupListeners = function() {
        $scope.$on($scope.register + '.showTabActivity', function(event, index, type) {
            $scope.showTabActivity(index, type);
        });
    }
    $scope.showTabActivity = function(index, type) {
        if ($scope.index !== index)
            return;
        switch (type) {
            case 'message':
                break;
            case 'error':
                break;
            default:
                $scope.bounceTab();
        }
    }
});;