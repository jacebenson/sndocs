/*! RESOURCE: /scripts/sn/common/link/directive.snLinkContentError.js */
angular.module('sn.common.link').directive('snLinkContentError', function(getTemplateUrl) {
    'use strict';
    return {
        restrict: 'A',
        replace: true,
        templateUrl: getTemplateUrl('snLinkContentError.xml'),
        scope: {
            link: "="
        },
        controller: function($scope) {}
    }
});;