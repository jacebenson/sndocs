/*! RESOURCE: /scripts/app.ng_chat/util/directive.snOptions.js */
angular.module('sn.connect.util').directive('snOptions', function(getTemplateUrl) {
    "use strict";
    return {
        restrict: 'E',
        templateUrl: getTemplateUrl("snOptions.xml"),
        replace: true
    };
});;