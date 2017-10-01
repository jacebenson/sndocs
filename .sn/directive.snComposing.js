/*! RESOURCE: /scripts/sn/common/presence/directive.snComposing.js */
angular.module('sn.common.presence').directive('snComposing', function(getTemplateUrl, snComposingPresence) {
    "use strict";
    return {
        restrict: 'E',
        templateUrl: getTemplateUrl("snComposing.xml"),
        replace: true,
        scope: {
            conversation: "="
        },
        controller: function($scope, $element) {
            var child = $element.children();
            if (child && child.tooltip)
                child.tooltip({
                    'template': '<div class="tooltip" style="white-space: pre-wrap" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
                    'placement': 'top',
                    'container': 'body'
                });
            $scope.snComposingPresence = snComposingPresence;
        }
    }
});;