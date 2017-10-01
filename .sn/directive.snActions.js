/*! RESOURCE: /scripts/app.ng_chat/util/directive.snActions.js */
angular.module('sn.connect.util').directive('snActions', function(getTemplateUrl) {
    "use strict";
    return {
        restrict: 'E',
        templateUrl: getTemplateUrl("snActions.xml"),
        replace: true
    };
});;