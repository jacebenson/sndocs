/*! RESOURCE: /scripts/sn/common/avatar/directive.snUserAvatar.js */
angular.module('sn.common.avatar').directive('snUserAvatar', function(getTemplateUrl) {
  "use strict";
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('sn_user_avatar.xml'),
    replace: true,
    scope: {
      userId: '=',
      avatarUrl: '=',
      initials: '=',
      enablePresence: '@'
    },
    controller: function($scope) {
      $scope.enablePresence = $scope.enablePresence === 'true';
      $scope.getBackgroundStyle = function() {
        if ($scope.avatarUrl && $scope.avatarUrl !== '')
          return {
            'background-image': 'url(' + $scope.avatarUrl + ')'
          };
        return '';
      };
    }
  }
});;