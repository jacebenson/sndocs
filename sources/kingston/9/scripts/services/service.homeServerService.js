/*! RESOURCE: /scripts/services/service.homeServerService.js */
angular.module('homeApp').factory('HomeServerService', function($http, $q) {
  "use strict";
  return {
    post: function(url, params, config) {
      var deferred = $q.defer();
      $http.post(url, params, config).success(function(data) {
        deferred.resolve(data);
      }).error(function() {
        deferred.reject("An error occured while sending items.");
      });
      return deferred.promise;
    },
    get: function(url, params) {
      var deferred = $q.defer();
      $http.get(url, params).success(function(data) {
        deferred.resolve(data);
      }).error(function() {
        deferred.reject("An error occured while fetching items.");
      });
      return deferred.promise;
    }
  }
});;