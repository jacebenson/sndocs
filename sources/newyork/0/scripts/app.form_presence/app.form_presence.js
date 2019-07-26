/*! RESOURCE: /scripts/app.form_presence/app.form_presence.js */
angular.module('sn.form_presence', ['sn.base', 'sn.common.presence', 'sn.messaging', 'sn.i18n', 'sn.common.controls', 'sn.common.avatar', 'sn.common.ui.popover', 'sn.common.user_profile']).directive('formPresence',
    function(snRecordWatcher, getTemplateUrl, $rootScope, $q) {
      "use strict";
      return {
        restrict: 'E',
        templateUrl: getTemplateUrl('ng_form_presence.xml'),
        controller: function($scope, $http, userData) {
          var viewingUsersCounter = 0;
          $scope.viewingUsers = [];
          if (g_form.isDatabaseView())
            return;
          $rootScope.$on('sn.sessions', function(somescope, presence) {
            validateViewingUsers(presence);
          });
          if (typeof(g_form) != "undefined")
            snRecordWatcher.initRecord(g_form.getTableName(), g_form.getUniqueValue());

          function validateViewingUsers(sessions) {
            var raceCounter = ++viewingUsersCounter;
            var viewingUsers = [];
            var promises = [];
            angular.forEach(sessions, function(item) {
              var user = {
                avatar: item.user_avatar,
                initials: item.user_initials,
                userID: item.user_id,
                displayName: item.user_display_name,
                name: item.user_display_name,
                status: item.status
              };
              if (user.avatar && user.initials)
                viewingUsers.push(user);
              else {
                promises.push(userData.getUserById(user.userID).then(function(userInfo) {
                  user.initials = userInfo.user_initials;
                  user.avatar = userInfo.user_avatar;
                  viewingUsers.push(user);
                }));
              }
            });
            $q.all(promises).then(function() {
              if (raceCounter == viewingUsersCounter)
                setViewingUsers(viewingUsers);
            });
          }

          function setViewingUsers(users) {
            $scope.viewingUsers = users;
            if ($scope.viewingUsers.length !== 0) {
              if (!$scope.$$phase)
                $rootScope.$apply();
              $rootScope.$emit('sn.presence', $scope.viewingUsers);
            }
          }
        },
        link: function($scope, $element) {
          $scope.$watch('viewingUsers.length', function(newValue, oldValue) {
            if (oldValue <= 1 && newValue > 1)
              $element.find('.sn-popover-presence').tooltip().popover();
          });
        }
      }
    }).run(function($rootScope, $http, userData, i18n) {
      "use strict";
      var previousMessages = {};
      var previousDecorations = {};
      if (typeof g_form != "undefined" && g_form.isDatabaseView())
        return;
      $rootScope.$on('record.updated', function(someScope, data) {
            if (data.sys_id !== g_form.getUniqueValue())
              return;
            var modifiedFields = g_form.modifiedFields;
            angular.forEach(data.changes, function(field) {
                  if (isConcurrentModification(data, field, modifiedFields) || isCurrentActiveElement(data, field)) {
                    if (!g_form.submitted)
                      showConcurrentFieldMsg(data, field);
                  } else {
                    var uiEl = g_form.getGlideUIElement(field);
                    if (!uiEl)
                      return;
                    if (uiEl.getType() == 'journal_input')
                      return;
                    if (!g_form.submitted && !g_submitted) {
                      showFieldUpdat