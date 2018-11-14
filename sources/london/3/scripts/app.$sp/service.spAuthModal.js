/*! RESOURCE: /scripts/app.$sp/service.spAuthModal.js */
angular.module('sn.$sp').factory('spAuthModal', function($q, spModal, i18n, $http, spAuthentication, glideUserSession, cabrillo, $cookies, $window, spUtil, $uibModal) {
      "use strict";

      function _showAuthenticationModal(requestParams, username, userSysId) {
        var currentUser;
        var deferred = $q.defer();
        glideUserSession.loadCurrentUser({
            reload: true
          }).then(function(user) {
              if (!user) {
                deferred.reject({
                  error: {
                    status: 'ANONYMOUS',
                    message: i18n.getMessage('Not logged in')
                  }
                });
                return;
              }
              currentUser = user;
              var serializedUser = {
                sysId: currentUser.userID,
                userName: currentUser.userName,
                firstName: currentUser.firstName,
                lastName: currentUser.lastName
              };
              if (cabrillo.isNative()) {
                cabrillo.auth.reauthenticate(currentUser).then(function() {
                  deferred.resolve(serializedUser);
                }, function(error) {
                  if (error && error.status) {
                    deferred.reject({
                      error: error
                    });
                  }
                  deferred.reject();
                });
                return;
              }
              var loginMethod = currentUser.$private.loginMethod;
              if (!loginMethod) {
                var providerSysId = $cookies.get('glide_sso_id');
                loginMethod = providerSysId ? 'saml' : 'db';
              }
              if (loginMethod === 'saml') {
                glideUser