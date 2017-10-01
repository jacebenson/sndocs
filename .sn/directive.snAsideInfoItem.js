/*! RESOURCE: /scripts/app.ng_chat/resource/directive.snAsideInfoItem.js */
angular.module('sn.connect.resource').directive('snAsideInfoItem', function(getTemplateUrl) {
    'use strict';
    var iconMap = {
        record: "icon-article-document",
        link: "icon-link",
        connect: "icon-collaboration",
        uipage: "icon-document",
        search: "icon-search",
        list: "icon-list",
        chart: "icon-poll",
        update: "icon-form",
        image: "icon-image",
        video: "icon-video",
        unauthorized: "icon-locked sn-highlight_negative",
        error: "icon-alert-triangle",
        pending: "icon-loading"
    };
    return {
        replace: true,
        restrict: 'E',
        templateUrl: getTemplateUrl('snAsideInfoItem.xml'),
        scope: {
            isLink: "=",
            title: "@",
            description: "@",
            link: "="
        },
        controller: function($scope) {
            $scope.isExternalIcon = function() {
                return !$scope.link.isPending && $scope.link.external;
            };
            $scope.getExternalIcon = function() {
                return "https://www.google.com/s2/favicons?domain=" + $scope.link.url.toLowerCase();
            };
            $scope.getIcon = function() {
                if ($scope.link.isUnauthorized)
                    return iconMap.unauthorized;
                if ($scope.link.isError)
                    return iconMap.error;
                if ($scope.link.isPending)
                    return iconMap.pending;
                return iconMap[$scope.link.type] || iconMap.link;
            };
        }
    }
});;