/*! RESOURCE: /scripts/app.$sp/service.spFacets.js */
angular.module('sn.$sp').factory('spFacetsClientService', function($rootScope, $location, $http, $q, spFacetManager) {
      'use strict';

      function _search(params) {
        return $http.post('/api/now/sp/search', params)
          .then(function successCallback(response) {
            if (params.include_facets) {
              spFacetManager.notify(response);
            }
            if (response.data.result) {
              var notifications = {};
              response.data.result.$$uiNotification.forEach(function(notification) {
                if (!notifications[notification.message]) {
                  notifications[notification.message] = notification;
                }
              });
              if (!params.include_facets) {
                $rootScope.$broadcast('$$uiNotification', _.values(notifications));
              }
            }
            return $q.when(response);
          }, function errorCallback(response) {});
      }
      return {
        search: function(params) {
            return