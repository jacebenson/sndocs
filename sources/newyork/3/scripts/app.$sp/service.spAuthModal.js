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
        glideUserSession.getSsoReauthenticationUrl().then(function(url) {
          requestParams.externalLoginURL = url;
          var modal;
          openExternalAuthModal(requestParams).then(function(m) {
            modal = m;
          });
          $window.onReauthenticationComplete = function(result) {
            deferred.resolve(serializedUser);
            modal.close();
          };
        });
      } else {
        spModal.open({
          title: i18n.getMessage("Approver authentication"),
          message: i18n.getMessage("Additional authentication is required, enter your usename and password to continue."),
          footerStyle: {
            border: 'none',
            'padding-top': 0
          },
          widget: 'simpleloginui',
          widgetInput: {},
          shared: requestParams,
          onSubmit: function() {
            return onLoginModalSubmit(requestParams, username);
          }
        }).then(function(confirm) {
          if (confirm.label == "OK") {
            deferred.resolve(serializedUser);
          } else {
            deferred.reject();
          }
        });
      }
    });
    return deferred.promise;
  }

  function onLoginModalSubmit(requestParams, username) {
    return $q(function(resolve, reject) {
      var errorMessage = null;
      if (!requestParams.username || requestParams.username.trim() === "" ||
        !requestParams.password || requestParams.password.trim() === "") {
        errorMessage = i18n.getMessage("User name or password invalid");
      } else if (requestParams.username !== username) {
        errorMessage = i18n.getMessage("Attempted to authenticate as a different user");
      }
      if (!errorMessage || errorMessage === "") {
        spAuthentication.validateCreds(requestParams.username, requestParams.password).then(function(res) {
          resolve({
            status: res.success,
            errorMessage: res.message
          });
        });
      } else {
        resolve({
          status: !errorMessage || errorMessage === "",
          errorMessage: errorMessage
        });
      }
    });
  }

  function openExternalAuthModal(requestParams) {
    var deferred = $q.defer();
    var options = {
      title: i18n.getMessage("Approver authentication"),
      message: '',
      messageOnly: false,
      errorMessage: '',
      input: false,
      label: '',
      size: 'lg',
      value: '',
      required: false,
      footerStyle: {
        border: 'none',
        'padding-top': 0
      },
      values: false,
      onSubmit: null,
      widget: 'simpleloginui',
      widgetInput: {},
      shared: requestParams,
      buttons: [{
        label: i18n.getMessage('Cancel'),
        cancel: true
      }]
    };
    var widgetURL = spUtil.getWidgetURL(options.widget);
    $http.post(widgetURL, options.widgetInput).success(function(response) {
      options.widget = response.result;
      options.widget.options.shared = options.shared;
      var modal = $uibModal.open({
        templateUrl: 'sp-modal.html',
        controller: spModalCtrl,
        size: options.size,
        resolve: {
          options: function() {
            return options;
          }
        }
      });
      deferred.resolve(modal);
    });
    return deferred.promise;
  }

  function spModalCtrl($scope, options) {
    $scope.options = options;
    $scope.form = {};
    $scope.buttonClicked = function(button) {
      if (button.cancel) {
        $scope.$dismiss();
        return;
      }
    }
  }
  return {
    prompt: _showAuthenticationModal
  }
});