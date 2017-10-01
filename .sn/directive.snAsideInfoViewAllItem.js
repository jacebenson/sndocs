/*! RESOURCE: /scripts/app.ng_chat/resource/directive.snAsideInfoViewAllItem.js */
angular.module('sn.connect.resource').directive('snAsideInfoViewAllItem', function(getTemplateUrl) {
    'use strict';
    return {
        replace: true,
        restrict: 'E',
        templateUrl: getTemplateUrl('snAsideInfoViewAllItem.xml'),
        scope: {
            title: "@",
            templateUrl: "@",
            minCount: "@",
            links: "="
        },
        controller: function($scope) {
            $scope.isShowing = function() {
                return $scope.links.length > $scope.minCount;
            };
            $scope.openView = function(evt) {
                if (evt.keyCode === 9)
                    return;
                $scope.$emit("sn.aside.open", {
                    templateUrl: getTemplateUrl($scope.templateUrl),
                    isChild: true,
                    scope: $scope.$parent
                });
            };
        }
    }
});;