/*! RESOURCE: /scripts/create_favorite/directive.magellanColorPicker.js */
angular.module('Magellan.createFavorite').directive('magellanColorPicker', ['getTemplateUrl', function(getTemplateUrl) {
    return {
        restrict: 'E',
        templateUrl: getTemplateUrl('magellan_color_picker.xml'),
        scope: {
            activeColor: '='
        },
        controller: function($scope, $rootScope, $http) {
            if (window.top && window.top.Magellan && window.top.Magellan.globals && window.top.Magellan.globals.navColors) {
                $scope.colors = window.top.Magellan.globals.navColors;
            } else {
                $http.get('/api/now/ui/favorite/iconsandcolors').then(function(response) {
                    if (response && response.data && response.data.result) {
                        if (response.data.result.colors) {
                            window.top.Magellan = window.top.Magellan || {};
                            window.top.Magellan.globals = window.top.Magellan.globals || {};
                            window.top.Magellan.globals.navColors = JSON.parse(response.data.result.colors);
                            $scope.colors = window.top.Magellan.globals.navColors;
                        }
                    }
                });
            }
            $scope.$watch('activeColor', function(newValue, oldValue) {
                if (newValue != oldValue) {
                    $rootScope.$broadcast('magellanColorPicker:colorSelected', newValue);
                }
            });
        }
    }
}]);;