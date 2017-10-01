/*! RESOURCE: /scripts/app.magellan/fast/directive.ngModelUpdateOnEnter.js */
angular.module('Magellan').directive('ngModelUpdateOnEnter', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
            'onEnter': '<?ngModelUpdateOnEnter'
        },
        link: function(scope, element, attrs, ctrl) {
            element.on('keyup', function(ev) {
                if (ev.keyCode === 13) {
                    _applyUtil(scope, function() {
                        ctrl.$commitViewValue();
                        if (scope.onEnter) {
                            scope.onEnter(ev);
                        }
                    });
                }
            });

            function _applyUtil($scope, f) {
                if (!$scope.$$phase) {
                    $scope.$apply(f);
                } else {
                    f();
                }
            }
        }
    };
});;