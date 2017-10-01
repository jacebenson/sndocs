/*! RESOURCE: /scripts/sn/common/user_profile/directive.snUserProfile.js */
angular.module('sn.common.user_profile').directive('snUserProfile', function(getTemplateUrl, snCustomEvent, $window, avatarProfilePersister, $timeout, $http) {
    "use strict";
    return {
        replace: true,
        restrict: 'E',
        templateUrl: getTemplateUrl('snUserProfile.xml'),
        scope: {
            profile: "=",
            showDirectMessagePrompt: "="
        },
        link: function(scope, element) {
            scope.showDirectMessagePromptFn = function() {
                if (scope.showDirectMessagePrompt) {
                    var activeUserID = $window.NOW.user_id || "";
                    return !(!scope.profile ||
                        activeUserID === scope.profile.sysID ||
                        (scope.profile.document && activeUserID === scope.profile.document));
                } else {
                    return false;
                }
            };
            $timeout(function() {
                element.find("#direct-message-popover-trigger").on("click", scope.openDirectMessageConversation);
            }, 0, false);
        },
        controller: function($scope, snConnectService) {
            if ($scope.profile && $scope.profile.userID && avatarProfilePersister.getAvatar($scope.profile.userID)) {
                $scope.profile = avatarProfilePersister.getAvatar($scope.profile.userID);
                $scope.$emit("sn-user-profile.ready");
            } else {
                $http.get('/api/now/live/profiles/sys_user.' + $scope.profile.userID).then(function(response) {
                    angular.merge($scope.profile, response.data.result);
                    avatarProfilePersister.setAvatar($scope.profile.userID, $scope.profile);
                    $scope.$emit("sn-user-profile.ready");
                })
            }
            $scope.openDirectMessageConversation = function(evt) {
                if (evt && evt.keyCode === 9)
                    return;
                $timeout(function() {
                    snConnectService.openWithProfile($scope.profile);
                }, 0, false);
                angular.element('.popover').each(function() {
                    angular.element('body').off('click.snUserAvatarPopoverClose');
                    angular.element(this).popover('hide');
                });
            };
        }
    }
});;