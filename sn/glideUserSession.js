/*! RESOURCE: /scripts/snm/auth/data/glideUserSession.js */
angular.module('snm.auth.data').provider('glideUserSession', function glideUserSessionProvider() {
    'use strict';
    var _initialLoginState;
    var _initialUser;
    this.setCurrentUser = function(user) {
        if (user) {
            _initialLoginState = true;
            _initialUser = {
                userID: user.user_id,
                userName: user.user_name,
                displayValue: user.display_name,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                mobilePhone: user.mobile_phone,
                phone: user.phone,
                title: user.title,
                avatar: user.avatar_path,
                preferences: null,
                allRoles: user.all_roles || null,
                roles: user.roles || null
            };
        }
    };
    this.$get = function glideUserSession($rootScope, $q, $http, $log, urlTools, glideUserFactory, $window, appResources, xmlUtil) {
        var $currentUser;
        var _currentLoginState = false;
        var _currentUser;
        $rootScope.$on('@page.login', function() {
            _currentLoginState = false;
            _initialLoginState = false;
            $currentUser = null;
        });

        function loadCurrentUser(options) {
            var reload = options && options.reload;
            if (!$currentUser || reload) {
                $currentUser = $q.defer();
                if (_initialLoginState && _initialUser && !reload) {
                    _currentUser = glideUserFactory.create(_initialUser);
                    $currentUser.resolve(_currentUser);
                    return $currentUser.promise;
                }
                loadUser().then(function(user) {
                    _currentUser = user;
                    $currentUser.resolve(_currentUser);
                }, function() {
                    if ($currentUser) {
                        $currentUser.reject();
                    }
                    $currentUser = null;
                });
            }
            return $currentUser.promise;
        }

        function loadUser(userID) {
            var params = {};
            var getCurrentUser = !userID;
            if (!getCurrentUser) {
                params['sysparm_user_id'] = userID;
            }
            var src = urlTools.getURL('get_user', params);
            return $http.get(src).then(function(response) {
                var user = glideUserFactory.create(response.data);
                if (getCurrentUser) {
                    user.$private = {
                        loginMethod: response.data.loginMethod
                    };
                }
                return user;
            });
        }

        function isLoggedIn() {
            return _initialLoginState || _currentLoginState;
        }

        function isExternalAuthEnabled() {
            return appResources.getBooleanProperty('glide.authenticate.multisso.enabled');
        }

        function getDefaultIdpRedirectUrl() {
            if (isExternalAuthEnabled()) {
                var redirectSysId = appResources.getProperty('glide.authenticate.sso.redirect.idp');
                if (redirectSysId && redirectSysId.length > 0) {
                    return getIdpRedirectUrl(redirectSysId);
                }
            }
        }

        function getIdpRedirectUrl(ssoId) {
            if (typeof ssoId === 'undefined' || ssoId === null || ssoId === '') {
                $log.warn('Invalid SSO sysId provided. Redirect URL is invalid');
            }
            return '/login_with_sso.do?glide_sso_id=' + encodeURIComponent(ssoId);
        }

        function logout(viaAjax) {
            if (viaAjax) {
                return $http.get('/logout.do');
            }
            $window.location.href = '/logout.do';
            var $d = $q.defer();
            return $d.promise;
        }

        function login(username, password, rememberMe) {
            _initialLoginState = false;
            $currentUser = null;
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
                switch (response.data.status) {
                    default:
                        case 'error':
                        _currentLoginState = false;
                    return $q.reject('invalid_username_or_password');
                    case 'mfa_code_required':
                            _currentLoginState = false;
                        return $q.reject(response.data.status);
                    case 'success':
                            _currentLoginState = true;
                        return loadCurrentUser();
                }
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
                if (!response.data) {
                    _currentLoginState = false;
                    return $q.reject('unknown_error');
                }
                _currentLoginState = response.data.status === 'success';
                if (!_currentLoginState) {
                    return $q.reject('invalid_mfa_code');
                }
                return loadCurrentUser();
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
            }).then(
                function(response) {
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
                }
            );
            return $d.promise;
        }

        function getSsoReauthenticationUrl(ssoProviderSysId) {
            var postParams = {
                sysparm_scope: 'global',
                sysparm_processor: 'ESignatureUtils',
                sysparm_name: 'createSsoReauthenticationUrl'
            };
            if (ssoProviderSysId) {
                postParams['glide_sso_id'] = ssoProviderSysId;
            }
            return $http({
                method: 'POST',
                url: '/xmlhttp.do',
                data: urlTools.encodeURIParameters(postParams),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                transformResponse: function(response) {
                    return xmlUtil.getDataFromXml(response, 'result');
                }
            }).then(
                function(response) {
                    var data = response.data ? response.data[0] : {};
                    if (data.error) {
                        return $q.reject({
                            message: data.error
                        });
                    }
                    return data.url;
                },
                function(response) {
                    switch (response.status) {
                        default:
                            case 404:
                            return $q.reject({
                            message: 'Cannot determine external authentication provider'
                        });
                    }
                }
            );
        }
        return {
            loadCurrentUser: loadCurrentUser,
            isLoggedIn: isLoggedIn,
            logout: logout,
            login: login,
            requestMfaCode: requestMfaCode,
            validateMfaCode: validateMfaCode,
            isExternalAuthEnabled: isExternalAuthEnabled,
            getDefaultIdpRedirectUrl: getDefaultIdpRedirectUrl,
            getSsoRedirectUrlForUsername: getSsoRedirectUrlForUsername,
            getSsoReauthenticationUrl: getSsoReauthenticationUrl,
            loadUser: loadUser
        };
    };
});;