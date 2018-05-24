/*! RESOURCE: /scripts/sn/common/user_profile/directive.snUserProfile.js */
angular.module('sn.common.user_profile').directive('snUserProfile', function(getTemplateUrl, snCustomEvent, $window, avatarProfilePersister) {
  "use strict";
  return {
    replace: true,
    restrict: 'E',
    templateUrl: getTemplateUrl('snUserProfile.xml'),
    scope: {
      profile: "=",
      showDirectMessagePrompt: "="
    },
    link: function(scope) {
      scope.showDirectMessagePromptFn = function() {
        if (scope.showDirectMessagePrompt) {
          var activeUserID = $window.NOW.user_id || "";
          if (!scope.profile ||
            activeUserID === scope.profile.sysID ||
            (scope.profile.document && activeUserID === scope.profile.document))
            return false;
          return true;
        } else {
          return false;
        }
      };
    },
    controller: function($scope) {
      if ($scope.profile && $scope.profile.userID && avatarProfilePersister.getAvatar($scope.profile.userID))
        $scope.profile = avatarProfilePersister.getAvatar($scope.profile.userID);
      $scope.$emit("sn-user-profile.ready");
      $scope.openDirectMessageConversation = function(evt) {
        if (evt.keyCode === 9)
          return;
        snCustomEvent.fireTop('chat:open_conversation', $scope.profile);
      };
    }
  }
});;