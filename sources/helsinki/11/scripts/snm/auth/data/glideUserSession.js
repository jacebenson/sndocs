/*! RESOURCE: /scripts/snm/auth/data/glideUserSession.js */
angular.module('snm.auth.data').provider('glideUserSession', function glideUserSessionProvider() {
  'use strict';
  var _initialLoginState;
  var _initialUser;
  this.setUserSession = function(session) {
    if (!session) {
      return;
    }
    _initialLoginState = session.initialLoginState;
    if (session.initialLoginState && session.initialUser) {
      _initialUser = session.initialUser;
    }
  };
  this.$get = function glideUserSession($rootScope, $q, $http, $log, urlTools, glideUserFactory, $window, glideSystemProperties, xmlUtil) {
    var $currentUser;
    var _currentLoginState = false;
    var _currentUser;
    $rootScope.$on('@page.login', function() {
      _currentLoginState = false;
      _initialLoginState = false;
      $currentUser = null;
    });

    function loadCurrentUser() {
      if (!$currentUser) {
        $currentUser = $q.defer();
        if (_initialLoginState && _initialUser) {
          _currentUser = glideUserFactory.create(_initialUser);
          $currentUser.resolve(_currentUser);
          return $currentUser.promise;
        }
        var src = urlTools.getURL('get_user');
        $http.get(src).then(function(response) {
          _currentUser = glideUserFactory.create(response.data);
          $currentUser.resolve(_currentUser);
        }, function() {
          if ($currentUser)
            $currentUser.reject();
          $currentUser = null;
        });
      }
      return $currentUser.promise;
    }

    function isLoggedIn() {
      return _initialLoginState || _currentLoginState;
    }

    function isExternalAuthEnabled() {
      return glideSystemProperties.get('glide.authenticate.multisso.enabled');
    }

    function getIdpRedirectUrl(ssoId) {
      var ssoRedirectUri;
      if (isExternalAuthEnabled()) {
        var redirectSysId = glideSystemProperties.get('glide.authenticate.sso.redirect.idp') || ssoId;
        if (redirectSysId && redirectSysId.length > 0) {
          ssoRedirectUri = '/login_with_sso.do?glide_sso_id=' + redirectSysId;
        }
      }
      return ssoRedirectUri;
    }

    function logout() {
      $window.location.href = '/logout.do';
      var $d = $q.defer();
      return $d.promise;
    }

    function login(username, password, rememberMe) {
      _initialLoginState = false;
      var params = {
        'sysparm_type': 'login',
        'ni.nolog.user_password': true,
        'remember_me': !!rememberMe,
        'user_name': username,
        'user_password': password
      };
      return _sendLoginRequest(params).then(function(response) {
        if (!response.data) {
          $log.warn('login server failure:', response);
          return $q.reject('unknown_error');
        }
        var status;
        switch (response.data.status) {
          default:
            case 'error':
            _currentLoginState = false;
          status = $q.reject('invalid_username_or_password');
          break;
          case 'success':
              _currentLoginState = true;
            status = $q.resolve(response.data.status);
            break;
          case 'mfa_code_required':
              _currentLoginState = false;
            status = $q.resolve(response.data.status);
            break;
        }
        return status;
      }, function(response) {
        $log.warn('login server failure:', response);
        _currentLoginState = false;
        return $q.reject('unknown_error');
      });
    }

    function requestMfaCode() {
      return _sendLoginRequest({
        send_mfa_code: true
      }).then(function(response) {
        var status;
        if (!response.data) {
          status = $q.reject('unknown_error');
        } else if (response.data.status === 'send_mfa_code_success') {
          status = $q.resolve('success');
        } else {
          status = $q.reject('send_mfa_code_failure');
        }
        return status;
      }, function(response) {
        $log.warn('mfa code delivery error:', response);
        return $q.reject('unknown_error');
      });
    }

    function validateMfaCode(mfaCode) {
      var params = {
        'sysparm_type': 'login',
        'validate_mfa_code': true,
        'mfa_code': mfaCode
      };
      return _sendLoginRequest(params).then(function(response) {
        var status;
        if (!response.data) {
          _currentLoginState = false;
          status = $q.reject('unknown_error');
        } else {
          _currentLoginState = response.data.status === 'success';
          status = _currentLoginState ? $q.resolve('success') : $q.reject('invalid_mfa_code');
        }
        return status;
      }, function(response) {
        $log.warn('mfa validation server error:', response);
        return $q.reject('unknown_error');
      });
    }

    function _sendLoginRequest(params) {
      return $http({
        method: 'POST',
        url: urlTools.getURL('view_form.login'),
        data: urlTools.encodeURIParameters(params),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
    }

    function getSsoRedirectUrlForUsername(username) {
      var $d = $q.defer();
      $http({
        method: 'POST',
        url: '/xmlhttp.do',
        data: urlTools.encodeURIParameters({
          sysparm_processor: 'MultiSSO_ClientHelper',
          sysparm_scope: 'global',
          sysparm_name: 'ssoByUser',
          sysparm_user_id: username
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        transformResponse: function(response) {
          return xmlUtil.getDataFromXml(response, 'result');
        }
      }).then(function(response) {
          var data = response.data[0];
          var url;
          if (data) {
            if (data.glide_sso_id) {
              url = getIdpRedirectUrl(data.glide_sso_id);
            } else {
              url = data.discovery_service_url;
            }
            $d.resolve(url);
          } else {
            $d.reject('No external identity provider found for the username: ' + username);
          }
        },
        function(err) {
          $d.reject(err);
        });
      return $d.promise;
    }
    return {
      loadCurrentUser: loadCurrentUser,
      isLoggedIn: isLoggedIn,
      logout: logout,
      login: login,
      requestMfaCode: requestMfaCode,
      validateMfaCode: validateMfaCode,
      isExternalAuthEnabled: isExternalAuthEnabled,
      getIdpRedirectUrl: getIdpRedirectUrl,
      getSsoRedirectUrlForUsername: getSsoRedirectUrlForUsername
    };
  };
}).config(function(glideUserSessionProvider) {
  glideUserSessionProvider.setUserSession(window['SNM_USER_SESSION']);
});;