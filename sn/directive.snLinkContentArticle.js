/*! RESOURCE: /scripts/sn/common/link/directive.snLinkContentArticle.js */
angular.module('sn.common.link').directive('snLinkContentArticle', function(getTemplateUrl) {
    'use strict';
    return {
        restrict: 'A',
        replace: true,
        templateUrl: getTemplateUrl('snLinkContentArticle.xml'),
        scope: {
            link: "="
        },
        controller: function($scope) {
            $scope.backgroundImageStyle = $scope.link.imageLink ?
                {
                    "background-image": 'url(' + $scope.link.imageLink + ')'
                } :
                {};
            $scope.isVisible = function() {
                var link = $scope.link;
                return !!link.shortDescription || !!link.imageLink;
            };
            $scope.hasDescription = function() {
                var link = $scope.link;
                return link.shortDescription && (link.shortDescription !== link.title);
            };
        }
    }
});;