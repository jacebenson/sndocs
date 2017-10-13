/*! RESOURCE: /scripts/app.$sp/service.spPreference.js */
angular.module('sn.$sp').factory('spPreference', function(nowServer, $http) {
  "use strict";
  return {
    set: function(name, value) {
      if (value !== null && typeof value === 'object')
        value = JSON.stringify(value);
      var dataURL = nowServer.getURL("$sp");
      var n = {
        sysparm_ck: g_ck,
        type: "set_preference",
        name: name,
        value: value
      }
      Object.keys(n).forEach(function(t) {
        dataURL += "&" + t + "=" + encodeURIComponent(n[t])
      })
      $http.post(dataURL);
    },
    get: function(name, callback) {
      if (name == null)
        return null;
      var dataURL = nowServer.getURL("$sp");
      var n = {
        sysparm_ck: g_ck,
        type: "get_preference",
        name: name
      }
      Object.keys(n).forEach(function(t) {
        dataURL += "&" + t + "=" + encodeURIComponent(n[t])
      })
      $http.post(dataURL).then(function(response) {
        var answer = response.data.value;
        if (callback && typeof callback === "function")
          callback(answer);
        else
          console.warn("spPreference.get synchronous use not supported in Service Portal (preference: " + name + "), use callback");
      })
    }
  }
});