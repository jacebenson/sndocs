/*! RESOURCE: /scripts/sn/common/avatar/directive.snAvatarPopover.js */
angular.module('sn.common.avatar').directive('snAvatarPopover', function($http, $compile, getTemplateUrl, avatarProfilePersister, $injector) {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: getTemplateUrl('sn_avatar_popover.xml'),
    replace: true,
    transclude: true,
    scope: {
      members: '=',
      primary: '=?',
      showPresence: '=?',
      enableContextMenu: '=?',
      enableTooltip: '=?',
      enableBindOnce: '@',
      displayMemberCount: "=?",
      groupAvatar: "@",
      nopopover: "=",
      directconversation: '@',
      conversation: '=',
      primaryNonAssign: '=?'
    },
    compile: function(tElement) {
      var template = tElement.html();
      return function(scope, element, attrs, controller, transcludeFn) {
        if (scope.directconversation) {
          if (scope.directconversation === "true")
            scope.directconversation = true;
          else
            scope.directconversation = false;
          scope.showdirectconversation = !scope.directconversation;
        } else {
          scope.showdirectconversation = true;
        }
        if ($injector.has('inSupportClient') && $injector.get('inSupportClient'))
          scope.showdirectconversation = false;
        if (scope.primaryNonAssign) {
          scope.primary = angular.extend({}, scope.primary, scope.primaryNonAssign);
          if (scope.users && scope.users[0])
            scope.users[0] = scope.primary;
        }

        function recompile() {
          if (scope.primaryNonAssign) {
            scope.primary = angular.extend({}, scope.primary, scope.primaryNonAssign);
            if (scope.users && scope.users[0])
              scope.users[0] = scope.primary;
          }
          var newElement = $compile(template, transcludeFn)(scope);
          element.html(newElement);
          if (scope.enableTooltip) {
            element.tooltip({
              placement: 'auto top',
              container: 'body'
            }).attr('data-original-title', scope.users[0].name).tooltip('fixTitle');
            if (element.hideFix)
              element.hideFix();
          }
        }
        if (attrs.enableBindOnce === 'false') {
          scope.$watch('primary', recompile);
          scope.$watch('primaryNonAssign', recompile);
          scope.$watch('members', recompile);
        }
        if (scope.enableTooltip && scope.nopopover) {
          var usersWatch = scope.$watch('users', function() {
            if (scope.users && scope.users.length === 1 && scope.users[0] && scope.users[0].name) {
              element.tooltip({
                placement: 'auto top',
                container: 'body'
              }).attr('data-original-title', scope.users[0].name).tooltip('fixTitle');
              if (element.hideFix)
                element.hideFix();
              usersWatch();
            }
          });
        }
      };
    },
    controller: function($scope, liveProfileID, $timeout, $element, $document, snCustomEvent) {
      $scope.randId = Math.random();
      $scope.loadEvent = 'sn-user-profile.ready';
      $scope.closeEvent = ['chat:open_conversation', 'snAvatar.closePopover', 'body_clicked'];
      $scope.popoverConfig = {
        template: '<div class="popover" role="tooltip"><div class="arrow"></div><div class="popover-content"></div></div>'
      };
      $scope.displayMemberCount = $scope.displayMemberCount || false;
      $scope.liveProfileID = liveProfileID;
      if ($scope.primaryNonAssign) {
        $scope.primary = angular.extend({}, $scope.primary, $scope.primaryNonAssign);
        if ($scope.users && $scope.users[0])
          $scope.users[0] = $scope.primary;
      }
      $scope.$watch('members', function(newVal, oldVal) {
        if (newVal === oldVal)
          return;
        if ($scope.members)
          buildAvatar();
      });
      $scope.noPopover = function() {
        $scope.popoverCursor = ($scope.nopopover || ($scope.members && $scope.members.length > 2)) ? "default" : "pointer";
        return ($scope.nopopover || ($scope.members && $scope.members.length > 2));
      }
      $scope.avatarType = function() {
        var result = [];
        if ($scope.groupAvatar || !$scope.users)
          return result;
        if ($scope.users.length > 1)
          result.push("group")
        if ($scope.users.length === 2)
          result.push("avatar-duo")
        if ($scope.users.length === 3)
          result.push("avatar-trio")
        if ($scope.users.length >= 4)
          result.push("avatar-quad")
        return result;
      }
      $scope.getBackgroundStyle = function(user) {
        var avatar = (user ? user.avatar : '');
        if ($scope.groupAvatar)
          avatar = $scope.groupAvatar;
        if (avatar && avatar !== '')
          return {
            'background-image': 'url(' + avatar + ')'
          };
        if (user && user.name)
          return '';
        return void(0);
      };
      $scope.stopPropCheck = function(evt) {
        $scope.$broadcast("snAvatar.closeOtherPopovers", $scope.randId);
        if (!$scope.nopopover) {
          evt.stopPropagation();
        }
      };
      $scope.$on("snAvatar.closeOtherPopovers", function(id) {
        if (id !== $scope.randId)
          snCustomEvent.fireTop('snAvatar.closePopover');
      });
      $scope.maxStringWidth = function() {
        var paddedWidth = parseInt($scope.avatarWidth * 0.8, 10);
        return $scope.users.length === 1 ? paddedWidth : paddedWidth / 2;
      };

      function buildInitials(name) {
        if (!name)
          return "--";
        var initials = name.split(" ").map(function(word) {
          return word.toUpperCase();
        }).filter(function(word) {
          return word.match(/^[A-Z]/);
        }).map(function(word) {
          return word.substring(0, 1);
        }).join("");
        return (initials.length > 3) ?
          initials.substr(0, 3) :
          initials;
      }
      $scope.avatartooltip = function() {
        if (!$scope.enableTooltip) {
          return '';
        }
        if (!$scope.users) {
          return '';
        }
        var names = [];
        $scope.users.forEach(function(user) {
          if (!user) {
            return;
          }
          names.push(user.name);
        });
        return names.join(', ');
      };

      function buildAvatar() {
        if (typeof $scope.primary === 'string') {
          $http.get('/api/now/live/profiles/sys_user.' + $scope.primary).then(function(response) {
            $scope.users = [{
              userID: $scope.primary,
              name: response.data.result.name,
              initials: buildInitials(response.data.result.name),
              avatar: response.data.result.avatar
            }];
          });
          return;
        }
        if ($scope.primary) {
          if ($scope.primary.userImage)
            $scope.primary.avatar = $scope.primary.userImage;
          if (!$scope.primary.userID && $scope.primary.sys_id)
            $scope.primary.userID = $scope.primary.sys_id;
        }
        $scope.isGroup = $scope.conversation && $scope.conversation.isGroup;
        $scope.users = [$scope.primary];
        if ($scope.primary && (!$scope.members || $scope.members.length <= 0) && ($scope.primary.avatar || $scope.primary.initials) && $scope.isDocument) {
          $scope.users = [$scope.primary];
        } else if ($scope.members && $scope.members.length > 0) {
          $scope.users = buildCompositeAvatar($scope.members);
        }
        $scope.presenceEnabled = $scope.showPresence && !$scope.isGroup && $scope.users.length === 1;
      }

      function buildCompositeAvatar(members) {
        var currentUser = window.NOW.user ? window.NOW.user.userID : window.NOW.user_id;
        var users = angular.isArray(members) ? members.slice() : [members];
        users = users.sort(function(a, b) {
          var aID = a.userID || a.document;
          var bID = b.userID || b.document;
          if (a.table === "chat_queue_entry")
            return 1;
          if (aID === currentUser)
            return 1;
          else if (bID === currentUser)
            return -1;
          return 0;
        });
        if (users.length === 2)
          users = [users[0]];
        if (users.length > 2 && $scope.primary && $scope.primary.name && $scope.primary.table === "sys_user") {
          var index = -1;
          angular.forEach(users, function(user, i) {
            if (user.sys_id === $scope.primary.sys_id) {
              index = i;
            }
          });
          if (index > -1) {
            users.splice(index, 1);
          }
          users.splice(1, 0, $scope.primary);
        }
        return users;
      }
      buildAvatar();
      $scope.loadFullProfile = function() {
        if ($scope.primary && !$scope.primary.sys_id && !avatarProfilePersister.getAvatar($scope.primary.userID)) {
          $http.get('/api/now/live/profiles/' + $scope.primary.userID).then(
            function(response) {
              try {
                angular.extend($scope.primary, response.data.result);
                avatarProfilePersister.setAvatar($scope.primary.userID, $scope.primary);
              } catch (e) {}
            });
        }
      }
    }
  }
});;