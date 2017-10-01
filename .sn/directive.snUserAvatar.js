/*! RESOURCE: /scripts/sn/common/avatar/directive.snUserAvatar.js */
angular.module('sn.common.avatar').directive('snUserAvatar', function(getTemplateUrl) {
    "use strict";
    return {
        restrict: 'E',
        templateUrl: getTemplateUrl('sn_user_avatar.xml'),
        replace: true,
        scope: {
            profile: '=?',
            userId: '=?',
            avatarUrl: '=?',
            initials: '=?',
            enablePresence: '@',
            disablePopover: '=?',
            directConversationButton: '=?',
            userName: '=?',
            isAccessible: '=?'
        },
        link: function(scope, element) {
            scope.evaluatedProfile = undefined;
            scope.backgroundStyle = undefined;
            scope.enablePresence = scope.enablePresence !== 'false';
            if (scope.profile) {
                scope.evaluatedProfile = scope.profile;
                scope.userId = scope.profile.userID || "";
                scope.avatarUrl = scope.profile.avatar || "";
                scope.initials = scope.profile.initials || "";
                scope.backgroundStyle = scope.getBackgroundStyle();
            } else if (scope.userId || scope.avatarUrl || scope.initials || scope.userName) {
                scope.evaluatedProfile = scope.profile = {
                    'userID': scope.userId || "",
                    'avatar': scope.avatarUrl || "",
                    'initials': scope.initials || "",
                    'userName': scope.userName || "",
                    'isAccessible': scope.isAccessible || false
                };
                scope.backgroundStyle = scope.getBackgroundStyle();
            } else {
                var unwatch = scope.$watch('profile', function(newVal) {
                    if (newVal) {
                        scope.evaluatedProfile = newVal;
                        scope.backgroundStyle = scope.getBackgroundStyle();
                        unwatch();
                    }
                })
            }
            scope.directConversationButton = scope.directConversationButton !== 'false' && scope.directConversationButton !== false;
            scope.template = '<sn-user-profile profile="evaluatedProfile" show-direct-message-prompt="::directConversationButton" class="avatar-popover avatar-popover-padding"></sn-user-profile>';
        },
        controller: function($scope) {
            $scope.getBackgroundStyle = function() {
                if (($scope.avatarUrl && $scope.avatarUrl !== '') || $scope.evaluatedProfile && $scope.evaluatedProfile.avatar !== '')
                    return {
                        "background-image": 'url(' + ($scope.avatarUrl || $scope.evaluatedProfile.avatar) + ')'
                    };
                return {
                    "background-image": ""
                };
            };
        }
    }
});;