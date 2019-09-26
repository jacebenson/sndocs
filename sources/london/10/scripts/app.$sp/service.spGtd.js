/*! RESOURCE: /scripts/app.$sp/service.spGtd.js */
angular.module('sn.$sp').factory('spGtd', function($q, $http, $rootScope, spUtil, i18n) {
  "use strict";
  var url = '/api/now/guided_tours/loader/tour';
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
        name: page,
        portal: portal
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
      params = [],
      kvpair = null;
    if (containsParameter) {
      sp = str.split('?');
      if (sp.length > 1) {
        params = sp[1].split('&').map(function(kv) {
          kvpair = kv.split('=');
          return {
            name: kvpair[0],
            value: kvpair[1]
          }
        });
      }
    }
    return params;
  }

  function getUrlParameterWithName(str, name) {
    var result = null;
    var params = getUrlParams(str);
    for (var i = 0; i < params.length; i++) {
      if (params[i].name === name) {
        result = params[i];
        break;
      }
    }
    return result;
  }

  function getToursForPage(options) {
    var defer = $q.defer();
    var state = null;
    if (sessionStorage) {
      state = sessionStorage.getItem('guided_tour:tour.state') || location.href.indexOf('gtd_preview_tour_id') >= 0;
      if (state) {
        _loadScript(options, null, state);
      }
    }
    if (!options || !options.page || !options.user || !options.portal) {
      defer.reject();
    } else {
      _getTourData(options.portal.sys_id, options.page.sys_id).then(
        function(data) {
          var pageid = getUrlParameterWithName(document.location.href, 'id');
          var filterByPageId = (pageid && pageid.value);
          data = data.filter(function(t) {
            var contt = getUrlParameterWithName(t.context, 'id');
            return (t.status === 'published') &&
              (t.hasRole === 'true') &&
              (filterByPageId ? (contt.value === pageid.value) : true);
          });
          if (!state && data && data.length) {
            _loadScript(options, data, state);
          }
          defer.resolve(data);
        },
        function() {
          defer.reject();
        });
    }
    return defer.promise;
  }

  function launch(tourId) {
    if (top.NOW && top.NOW.guidedToursService) {
      top.NOW.guidedToursService.startTour(tourId, 0);
    }
  }
  return {
    getToursForPage: getToursForPage,
    launch: launch
  };
});;