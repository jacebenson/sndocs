/*! RESOURCE: /scripts/app.$sp/service.spPreference.js */
angular.module('sn.$sp').factory('spPreference', function(spConf, $http, $window) {
      'use strict';
      return {
        set: function(name, value) {
          if (value !== null && typeof value === 'object')
            value = JSON.stringify(value);
          var n = $.param({
            sysparm_type: spConf.sysParamType,
            sysparm_ck: $window.g_ck,
            type: 'set_preference',
            name: name,
            value: value
          });
          return $http.post(spConf.angularProcessor + '?' + n);
        },
        get: function(name, callback) {
            if (name == null)
              return null;
            var n = $.param({
              sysparm_type: spConf.sysParamType,
              sysparm_ck: $window.g_ck,
              type: 'get_preference',
              name: name
            });
            return $http.post(spConf.angularProcessor + '?' + n).then(function(response) {
                  var answer = response.data.value;
                  if (callback && typeof callback === "function")
                    c