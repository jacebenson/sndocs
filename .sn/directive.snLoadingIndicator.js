/*! RESOURCE: /scripts/app.ng_chat/util/directive.snLoadingIndicator.js */
angular.module('sn.connect.util').directive('snLoadingIndicator', function(getTemplateUrl) {
    "use strict";
    return {
        restrict: 'E',
        scope: {
            active: "="
        },
        transclude: true,
        templateUrl: getTemplateUrl("snLoadingIndicator.xml"),
        replace: true
    }
});;