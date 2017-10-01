/*! RESOURCE: /scripts/app.$sp/service.spAuthentication.js */
angular.module('sn.$sp').factory('spAuthentication', function($rootScope, $q, $http, spUtil, i18n) {
    'use strict';
    var genericError = i18n.getMessage('There was an error processing your request');
    var sessionUsername = $rootScope.user.user_name;
    var authEndpoint = spUtil.getURL({
        sysparm_type: 'view_form.login'
    });

    function _success() {
        return $q(function(resolve) {
            resolve({
                success: true
            });
        });
    }

    function _error(message) {
        return $q(function(resolve) {
            resolve({
                success: false,
                message: message || genericError
            });
        });
    }

    function _authenticate(username, password, additionalOptions) {
        var options = {
            'sysparm_type': 'login',
            'ni.nolog.user_password': true,
            'user_name': username,
            'user_password': password
        };
        return $http({
            method: 'post',
            url: authEndpoint,
            data: $.param(_.extend({}, options, additionalOptions || {})),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(function(response) {
            if (!response.data) {
                return _error();
            }
            if (response.data.status !== 'success') {
                return _error(response.data.message);
            }
            return _success();
        }, function(error) {
            return _error();
        });
    }

    function _validate(username, password) {
        if (username !== sessionUsername) {
            return _error(i18n.getMessage('Specified username does not match with the username of currently logged in user'));
        }
        return _authenticate(username, password);
    }
    return {
        validateCreds: _validate
    };
});;