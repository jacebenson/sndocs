/*! RESOURCE: /scripts/app.$sp/directive.spPageRow.js */
angular.module('sn.$sp').directive('spPageRow', function($rootScope, $compile) {
    return {
        restrict: 'E',
        templateUrl: 'sp_page_row',
        compile: function($tElement) {
            var el = angular.element($tElement[0]);
            var recursiveNode = el.children(".sp-row-content").remove();
            return function(scope, element, attrs) {
                var newNode = recursiveNode.clone();
                element.append(newNode);
                $compile(newNode)(scope);
            };
        },
        replace: false,
        scope: {
            columns: "=",
            container: "=",
            row: '='
        },
        controller: function($scope) {}
    }
});