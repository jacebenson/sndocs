/*! RESOURCE: /scripts/app.$sp/service.spGtd.js */
angular.module('sn.$sp').factory('spGtd', function($q, $http, $rootScope, spUtil, i18n) {
  "use strict";
  var url = '/api/now/guided_tours/tours';
  var guidedToursAPIEvents = {
    TOUR_STARTED: 'tourStarted',
    STEP_STARTED: 'stepStarted',
    TOUR_ABANDONED: 'tourAbandoned',
    TOUR_FAILED: 'tourFailed',
    TOUR_COMPLETED: 'tourCompleted',
    TOUR_ENDED: 'tourEnded',
    TOUR_DISMISSED: 'tourDismissed',
  };
  var tourServiceEvents = {
    tourStarted: 'tourStarted',
    stepStarted: 'step_started',
    abandoned: 'abandoned',
    failed: 'failed',
    completed: 'completed',
    tourEnded: 'tourEnded',
    dismissed: 'dismissed'
  }
  try {
    top.NOW = top.NOW || {};
    top.NOW.gtdConfig = top.NOW.gtdConfig || {
      servicePortalTours: true,
      displayMessage: {
        info: function(msg) {
          spUtil.addInfoMessage(msg);
        },
        error: function(msg) {
          spUtil.addErrorMessage(msg);
        }
      },
      i18n: i18n
    };
    top.NOW.guided_tours = top.NOW.guided_tours || getGuidedTourAPI();
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
      _insertPlayerScript();
    } else {
      top.NOW.guidedToursService.setConfig(top.NOW.gtdConfig);
      top.NOW.guidedToursService.trigger('check-autolaunch', {
        location: window.location,
        config: top.NOW.gtdConfig
      })
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

  function isAdditonalParamsMatched(context, url) {
    var defaultPrams = ['gtd_portal_title', 'gtd_page_title', 'id'];
    var additionalParams = getUrlParams(context).filter(function(item) {
      return defaultPrams.indexOf(item.name) === -1;
    });
    for (var i = 0; i < additionalParams.length; i++) {
      var param = additionalParams[i];
      var urlParm = param && param.name ? getUrlParameterWithName(url, param.name) : '';
      if ((urlParm && urlParm.value) !== param.value)
        return false;
    }
    return true;
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
          var url = document.location.href;
          var pageid = getUrlParameterWithName(url, 'id');
          var filterByPageId = (pageid && pageid.value);
          var tourOptions = null;
          data = data.filter(function(t) {
            if (!isAdditonalParamsMatched(t.context, url))
              return false;
            var contt = getUrlParameterWithName(t.context, 'id');
            if (filterByPageId) {
              if (contt.value === pageid.value) return true;
              if (t.options) {
                try {
                  tourOptions = JSON.parse(t.options);
                  if (tourOptions.isMapped && tourOptions.actualContext === contt.value) {
                    return true;
                  }
                } catch (e) {
                  return false;
                }
              }
              return false;
            }
            return true;
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

  function getGuidedTourAPI() {
    var GuidedToursManager = {
      api: {
        startTour: _startTour,
        endTour: _endTour,
        applyListFilter: _applyListFilter,
        getAllTours: _getAllTours,
        loadPlayer: _loadPlayer
      },
      events: {
        on: _on,
        off: _off
      },
      _filterFunc: null,
      _tourService: null,
      _registerEvents: _registerEvents
    };
    return GuidedToursManager;
  }

  function _startTour(sysId, stepNum, cb) {
    if (!top.NOW.guided_tours._tourService)
      return;
    stepNum = (stepNum) ? stepNum : 0;
    if (top.NOW.guided_tours._tourService.currentTour) {
      cb && cb({
        success: false,
        message: i18n.getMessage("Cannot start a new tour while another tour is in progress.")
      })
      return;
    }
    top.NOW.guided_tours._tourService.startTour(sysId, stepNum, cb);
  }

  function _endTour() {
    if (!top.NOW.guided_tours._tourService)
      return;
    top.NOW.guided_tours._tourService.endTour();
  }

  function _applyListFilter(filterFunc) {
    top.NOW.guided_tours._filterFunc = filterFunc;
  }

  function _getAllTours(cb) {
    if (!top.NOW.guided_tours._tourService)
      return;
    var toursList = [];
    var filterFunc;
    getToursForPage({
      portal: $rootScope.portal,
      page: $rootScope.page,
      user: $rootScope.user
    }).then(
      function(data) {
        toursList = data;
        try {
          filterFunc = top.NOW.guided_tours._filterFunc;
          if (filterFunc)
            toursList = toursList.filter(filterFunc);
          return cb && cb(null, toursList);
        } catch (err) {
          cb && cb(err);
        }
      },
      function() {
        defer.reject;
      });
  }

  function _loadPlayer() {
    try {
      if (top === window) {
        if (NOW && NOW.guidedToursService) {} else {
          _insertPlayerScript();
        }
      }
    } catch (e) {
      console && console.log('An error has occured. Guided Tours could not be loaded!');
    }
  }

  function _registerEvents(service) {
    var GT_API = top.NOW.guided_tours;
    GT_API._tourService = service;
    GT_API._tourService.on(tourServiceEvents.tourStarted, function(args) {
      _trigger(guidedToursAPIEvents.TOUR_STARTED, args);
    });
    GT_API._tourService.on(tourServiceEvents.stepStarted, function(args) {
      _trigger(guidedToursAPIEvents.STEP_STARTED, args);
    });
    GT_API._tourService.on(tourServiceEvents.abandoned, function(args) {
      _trigger(guidedToursAPIEvents.TOUR_ABANDONED, args);
    });
    GT_API._tourService.on(tourServiceEvents.failed, function(args) {
      _trigger(guidedToursAPIEvents.TOUR_FAILED, args);
    });
    GT_API._tourService.on(tourServiceEvents.completed, function(args) {
      _trigger(guidedToursAPIEvents.TOUR_COMPLETED, args);
    });
    GT_API._tourService.on(tourServiceEvents.tourEnded, function(args) {
      _trigger(guidedToursAPIEvents.TOUR_ENDED, args);
    });
    GT_API._tourService.on(tourServiceEvents.dismissed, function(args) {
      _trigger(guidedToursAPIEvents.TOUR_DISMISSED, args);
    });
  }

  function _on(event, cbFunc) {
    if (CustomEvent)
      CustomEvent.on(event, cbFunc);
  }

  function _off(event, func) {
    if (CustomEvent)
      if (!func || typeof func !== 'function')
        CustomEvent.unAll(event);
      else
        CustomEvent.un(event, func);
  }

  function _trigger(event, args) {
    CustomEvent.fireTop(event, args);
  }

  function _insertPlayerScript() {
    var script = document.createElement('script');
    script.src = '/scripts/app.guided_tours/guided_tours_player.js?v=' + g_builddate;
    script.type = 'text/javascript';
    script.async = 'true';
    var firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode.insertBefore(script, firstScript);
  }
  return {
    getToursForPage: getToursForPage,
    launch: launch
  };
});;