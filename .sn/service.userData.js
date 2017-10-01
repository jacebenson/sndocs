/*! RESOURCE: /scripts/app.form_presence/service.userData.js */
angular.module('sn.form_presence').service('userData', function($http, $q) {
    var userCache = {
        sys_id: {},
        user_name: {}
    }

    function tryCache(field, value) {
        return userCache[field][value];
    }

    function loadCache(result) {
        userCache.sys_id[result.user_sys_id] = result;
        userCache.user_name[result.user_name] = result;
    }

    function getUserBy(field, value) {
        var defered = $q.defer();
        var cachedResult = tryCache(field, value);
        if (cachedResult) {
            defered.resolve(cachedResult);
            return defered.promise;
        }
        var url = '/api/now/ui/user/';
        if (field == 'user_name')
            url += 'user_name/' + value;
        else
            url += value;
        $http.get(url).success(function(response) {
            loadCache(response.result);
            defered.resolve(response.result);
        });
        userCache[field][value] = defered.promise;
        return defered.promise;
    }
    return {
        getUserById: function(userId) {
            return getUserBy('sys_id', userId);
        },
        getUserByName: function(userName) {
            return getUserBy('user_name', userName);
        }
    }
});