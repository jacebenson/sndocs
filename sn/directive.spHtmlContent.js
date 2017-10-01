/*! RESOURCE: /scripts/app.$sp/directive.spHtmlContent.js */
angular.module('sn.$sp').directive('spHtmlContent', function($sce) {
    return {
        template: '<p ng-bind-html="trustAsHtml(model)"></p>',
        restrict: 'E',
        replace: true,
        scope: {
            model: '='
        },
        link: function(scope, element, attrs, controller) {
            scope.trustAsHtml = $sce.trustAsHtml;
            scope.$watch('model', function() {
                Prism.highlightAll();
            })
        }
    }
});