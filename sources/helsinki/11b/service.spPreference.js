/*! RESOURCE: /scripts/app.$sp/service.spPreference.js */
angular.module('sn.$sp').factory('spPreference', function(nowServer, $http) {
  "use strict";
  return {
    set: function(name, value) {
      var dataURL = nowServer.getURL("$sp");
      var n = {
        sysparm_ck: g_ck,
        type: "set_preference",
        name: name,
        value: value
      }
      Object.keys(n).forEach(function(t) {
        dataURL += "&" + t + "=" + n[t]
      })
      $http.post(dataURL);
    }
  }
});