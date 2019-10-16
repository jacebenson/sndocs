/*! RESOURCE: /scripts/app.$sp/service.spGtd.js */
angular.module('sn.$sp').factory('spGtd', function($q, $http, $rootScope, spUtil, i18n) {
      "use strict";
      var url = '/api/now/guided_tours/tours';
      try {
        top.NOW = top.NOW || {};
        top.NOW.gtdConfig = top.NOW.gtdConfig || {
          servicePortalTours: true,
          i18n: i18n,
          displayMessage: {
            info: function(msg) {
              spUtil.addInfoMessage(msg);
            },
            error: function(msg) {
              spUtil.addErrorMessage(msg);
            }
          }
        };
      } catch (e) {
        return {
          getToursForPage: function() {
            var defer = $q.defer();
            defer.reject();
            return defer.promise;
          },
          launch: function() {}
        };
      }
      $rootScope.$on('$locationChangeSuccess', function(e, newUrl, oldUrl) {
        if (top.NOW && top.NOW.guidedToursService) {
          top.NOW.gtdConfig.tours = null;
          top.NOW.gtdConfig.state = null;
          top.NOW.gtdConfig.portal_id = null;
          top.NOW.gtdConfig.page_id = null;
          top.NOW.guidedToursService.setConfig(top.NOW.gtdConfig);
        }
      });

      function _getTourData(portal, page) {
        var defer = $q.defer();
        $http({
          method: 'GET',
          url: url,
          params: {
            page_id: page,
            portal_id: portal,
            type: 'service_portal'
          }
        }).then(function(response) {
          defer.resolve(response.data.result);
        }, function(err) {
          defer.reject(err);
        });
        return defer.promise;
      }

      function _loadScript(options, tours, state) {
        top.NOW.gtdConfig.tours = tours;
        top.NOW.gtdConfig.state = state;
        top.NOW.gtdConfig.portal_id = options.portal.sys_id;
        top.NOW.gtdConfig.page_id = options.page.sys_id;
        if (!top.NOW.guidedToursService) {
          var script = document.createElement('script');
          script.src = '/scripts/app.guided_tours/guided_tours_player.js';
          script.type = 'text/javascript';
          script.async = 'true';
          var firstScript = document.getElementsByTagName('script')[0];
          firstScript.parentNode.insertBefore(script, firstScript);
        } else {
          top.NOW.guidedToursService.setConfig(top.NOW.gtdConfig);
        }
      }

      function getUrlParams(str) {
        var containsParameter = str.indexOf('?') >= 0;
        var sp = null,
          param