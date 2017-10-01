/*! RESOURCE: /scripts/app.$sp/directive.spEmailElement.js */
angular.module('sn.$sp').directive('spEmailElement', function(getTemplateUrl) {
    "use strict";
    return {
        restrict: 'E',
        templateUrl: 'sp_element_email.xml'
    };
});;