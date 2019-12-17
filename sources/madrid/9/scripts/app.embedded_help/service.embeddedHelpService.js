/*! RESOURCE: /scripts/app.embedded_help/service.embeddedHelpService.js */
angular.module('sn.embedded_help').service('embeddedHelpService',
  ['$rootScope', '$http', '$q', '$window', '$location', '$cacheFactory', 'snCustomEvent', 'autoClosePane', 'persistGuidedSetupActions', 'helpUrl',
    function($rootScope, $http, $q, $window, $location, $cacheFactory, snCustomEvent, autoClosePane, persistGuidedSetupActions, helpUrl) {
      "use strict";
      var TOUR_SYS_ID_KEY = "embedded_help:tour:sys_id";
      var TOUR_NAME_KEY = "embedded_help:tour:name";
      var GUIDED_SETUP_CONFIG_KEY = "embedded_help:guided_setup:config";
      var DEFAULT_DOCUMENTATION_LINK = 'context_help.do';
      var EMBEDDED_HELP_CONTENT = "sys_embedded_help_content.do";
      var embeddedHelpLink = "";
      var editArticleLink = "";
      var resultCache = $cacheFactory('embedded_help_results');
      var documentationLink = helpUrl || DEFAULT_DOCUMENTATION_LINK;
      var page = "";
      var qualifier = "";
      var modifier = "normal";
      var guidedSetupConfig = getGuidedSetupConfig();
      var activeTourSysId = getActiveTourSysId();
      var activeTourName = getActiveTourName();
      var queryString = "";
      var sysId = "";
      this.retrievePageDoc = function() {
        var deferred = $q.defer();
        if (typeof page == 'undefined' || page == "")
          deferred.reject('page not set');
        var endpoint = "/api/now/embeddedhelp/" + page + "/" + modifier;
        if (typeof qualifier != 'undefined' && qualifier != "" && qualifier !== "null")
          endpoint = endpoint + "/" + qualifier;
        else if (typeof queryString != 'undefined' && queryString != "" && queryString !== "null")
          endpoint = endpoint + queryString;
        var cachedItem = resultCache.get(endpoint);
        if (cachedItem) {
          deferred.resolve(cachedItem);
          return deferred.promise;
        }
        this.getEmbeddedHelp(endpoint).then(function success(response) {
          resultCache.put(endpoint, response.data);
          deferred.resolve(response.data);
          var result = response.data.result;
          if (typeof result != 'undefined' && result.length > 0) {
            for (var i = 0; i < result.length; i++) {
              if (result[i].type === 'content') {
                sysId = result[i].sysId;
              }
            }
          }
          $rootScope.$broadcast(EmbeddedHelpEvents.CONTENT_LOAD, '/nav_to.do?uri=/' + EMBEDDED_HELP_CONTENT + '?sys_id=' + sysId);
        }, function error(response) {
          console.error(angular.toJson(response));
          deferred.reject('Unknown error occurred');
        });
        return deferred.promise;
      }
      this.extractedLocationQuery = function(location) {
        if (typeof location != 'undefined') {
          page = location;
          if (page.charAt(0) == '/')
            page = page.substring(1, page.indexOf(".do"));
        }
        if (!helpUrl) {
          setDocumentationLink(location);
          $rootScope.$broadcast(EmbeddedHelpEvents.DOCUMENT_LINK_CHANGE, this.getDocumentationLink());
        }
        setAddHelpArticle(location);
        return page;
      }
      this.getDocumentationLink = function() {
        return documentationLink;
      }

      function setDocumentationLink(location) {
        if (!location) {
          documentationLink = DEFAULT_DOCUMENTATION_LINK;
          return;
        }
        var urlParts = location.split('?');
        var urlName = urlParts[0];
        var urlParams = urlParts[1] || '';
        var sysIdLoc = urlParams.search(/sys_id=[0-9a-f]{32}/i);
        var sysId = (sysIdLoc != -1) ? urlParams.substr(sysIdLoc, 39) : null;
        var urlSearch = '?sysparm_url=' + urlName;
        if (sysIdLoc != -1)
          urlSearch += '&' + sysId;
        documentationLink = DEFAULT_DOCUMENTATION_LINK + urlSearch;
      }
      this.addHelpArticle = function() {
        return embeddedHelpLink;
      }

      function setAddHelpArticle(location) {
        if (typeof qualifier == 'undefined' || qualifier == "" || qualifier == "null") {
          embeddedHelpLink = '/nav_to.do?uri=' + encodeURIComponent(EMBEDDED_HELP_CONTENT + '?sys_id=-1&sysparm_query=page=' + page + '^modifier=' + modifier + '^name=' + page + '-' + modifier);
        } else {
          embeddedHelpLink = '/nav_to.do?uri=' + encodeURIComponent(EMBEDDED_HELP_CONTENT + '?sys_id=-1&sysparm_query=page=' + page + '^modifier=' + modifier + '^name=' + page + '-' + modifier + '^qualifier=' + qualifier);
        }
      }
      this.getEmbeddedHelp = function(endpoint) {
        return $http.get(endpoint);
      }
      this.setQualifier = function(qual) {
        qualifier = qual;
      }
      this.locationChange = function(location) {
        var locationValue = "";
        if (location != 'undefined') {
          locationValue = location;
          locationValue = encodeURIComponent(locationValue);
          locationValue = '?uri=' + locationValue;
        }
        if (!isGuidedSetupSticky()) {
          modifier = "normal";
          qualifier = "";
          queryString = locationValue;
        } else {
          modifier = "setup";
          var isSourceLocation = location && guidedSetupConfig.sourceLocation && normalizeUrlCompare(location, guidedSetupConfig.sourceLocation) !== -1;
          if (!guidedSetupConfig.sourceLocation) {
            guidedSetupConfig.sourceLocation = location;
            qualifier = qualifier || guidedSetupConfig.sourceQualifier;
          } else if (!persistGuidedSetupActions && (!isSourceLocation && !activeTourSysId)) {
            guidedSetupConfig.actions = [];
          } else if (isSourceLocation && !guidedSetupConfig.actions.length) {
            guidedSetupConfig.actions = createCopy(guidedSetupConfig.sourceActions);
            qualifier = guidedSetupConfig.sourceQualifier;
          } else if (typeof qualifier == 'undefined' || qualifier == "" || qualifier == "null") {
            queryString = locationValue;
          }
        }
        return this.extractedLocationQuery(location);
      }
      this.enableGuidedSetup = function(config) {
        modifier = "setup";
        guidedSetupConfig = config || {};
        guidedSetupConfig.sourceActions = createCopy(guidedSetupConfig.actions);
        if (config != null && typeof config != 'undefined') {
          if (config.qualifier != null && typeof config.qualifier != 'undefined')
            qualifier = guidedSetupConfig.sourceQualifier = config.qualifier;
          $window.sessionStorage.setItem(GUIDED_SETUP_CONFIG_KEY, angular.toJson(config));
        }
      }
      this.disableGuidedSetup = function(eventName) {
        modifier = "normal";
        guidedSetupConfig = {};
        qualifier = "";
        $window.sessionStorage.removeItem(GUIDED_SETUP_CONFIG_KEY);
      }
      this.getGuidedSetupConfig = function() {
        return getGuidedSetupConfig();
      }
      this.isGuidedSetupSticky = function() {
        return isGuidedSetupSticky();
      }
      this.handleGuidedSetupAction = function(action) {
        var backToGuidedSetupUrl = guidedSetupConfig.url;
        if (getActiveTourSysId())
          this.endTour();
        switch (action) {
          case EmbeddedHelpEvents.GUIDED_SETUP_ACTION_EXIT:
            this.disableGuidedSetup();
            snCustomEvent.fireTop(EmbeddedHelpEvents.PANE_LOAD, {
              relativePath: $window.$location
            });
            return;
          case EmbeddedHelpEvents.GUIDED_SETUP_ACTION_BACK:
            this.disableGuidedSetup();
            goToGuidedSetupUrl(backToGuidedSetupUrl);
            break;
          default:
            var apiUrl = "";
            angular.forEach(guidedSetupConfig.actions, function(value, key) {
              if (value.name === action) {
                apiUrl = value.apiUrl;
                return;
              }
            });
            if (!apiUrl) {
              console.error('Guided Setup api url not provided for: ' + action);
              return;
            }
            $http.post(apiUrl).then(function success(response) {
              guidedSetupConfig.actions = guidedSetupConfig.sourceActions = response.data.result;
              $window.sessionStorage.setItem(GUIDED_SETUP_CONFIG_KEY, angular.toJson(guidedSetupConfig));
              goToGuidedSetupUrl(backToGuidedSetupUrl);
            }, function error(response) {
              console.error(response);
            });
        }
      }
      $rootScope.$watch(function() {
        return guidedSetupConfig.actions;
      }, function(newValue, oldValue) {
        $rootScope.$broadcast(EmbeddedHelpEvents.GUIDED_SETUP_ACTIONS_CHANGE, newValue);
      });

      function getGuidedSetupConfig() {
        return angular.fromJson($window.sessionStorage.getItem(GUIDED_SETUP_CONFIG_KEY)) || {};
      }

      function isGuidedSetupSticky() {
        return !angular.equals({}, guidedSetupConfig);
      }

      function goToGuidedSetupUrl(url) {
        var frame = angular.element('#gsft_main');
        if (frame.length)
          frame[0].src = url;
        if (autoClosePane)
          $rootScope.$broadcast('help_pane.toggle_collapsed_state', true);
      }

      function createCopy(obj) {
        if (!obj)
          return null;
        return angular.fromJson(angular.toJson(obj));
      }
      this.startTour = function(tour_sys_id, tour_name) {
        $rootScope.$evalAsync(function() {
          if (top.NOW && top.NOW.guidedToursService) {
            top.NOW.guidedToursService.startTour(tour_sys_id, 0);
          } else {
            var counter = 0;
            var interval = setInterval(function() {
              counter++;
              if (top.NOW && top.NOW.guidedToursService) {
                clearInterval(interval);
                top.NOW.guidedToursService.startTour(tour_sys_id, 0);
              }
              if (counter == 5) {
                clearInterval(interval);
              }
            }, 2000);
          }
        });
        $window.sessionStorage.setItem(TOUR_SYS_ID_KEY, tour_sys_id);
        $window.sessionStorage.setItem(TOUR_NAME_KEY, tour_name);
        activeTourSysId = tour_sys_id;
        activeTourName = tour_name;
        if (autoClosePane)
          $rootScope.$broadcast('help_pane.toggle_collapsed_state', true);
      }
      this.endTour = function() {
        $rootScope.$evalAsync(function() {
          top.NOW.guidedToursService.endTour();
        });
        $window.sessionStorage.removeItem(TOUR_SYS_ID_KEY);
        activeTourSysId = "";
        $window.sessionStorage.removeItem(TOUR_NAME_KEY);
        activeTourName = "";
        if (isGuidedSetupSticky() && !persistGuidedSetupActions)
          guidedSetupConfig.actions = guidedSetupConfig.sourceLocation.indexOf(page) >= 0 ? createCopy(guidedSetupConfig.sourceActions) : [];
        if (autoClosePane)
          $rootScope.$broadcast('help_pane.toggle_collapsed_state', false);
      }
      this.getActiveTourSysId = function() {
        return getActiveTourSysId();
      }
      this.getActiveTourName = function() {
        return getActiveTourName();
      }
      $rootScope.$watch(function() {
        return activeTourSysId;
      }, function(newValue, oldValue) {
        if (newValue !== oldValue)
          $rootScope.$broadcast(EmbeddedHelpEvents.TOUR_STATE_ID, newValue);
      });
      $rootScope.$watch(function() {
        return activeTourName;
      }, function(newValue, oldValue) {
        if (newValue !== oldValue) {
          $rootScope.$broadcast(EmbeddedHelpEvents.TOUR_STATE_NAME, newValue);
        }
      });

      function getActiveTourSysId() {
        if (typeof top.NOW.guidedToursService == 'undefined') {
          return null;
        }
        if (!top.NOW.guidedToursService.isTourRunning()) {
          activeTourSysId = "";
          $window.sessionStorage.removeItem(TOUR_SYS_ID_KEY);
        } else {
          activeTourSysId = $window.sessionStorage.getItem(TOUR_SYS_ID_KEY);
        }
        return activeTourSysId;
      }

      function getActiveTourName() {
        if (typeof top.NOW.guidedToursService == 'undefined') {
          return null;
        }
        if (!top.NOW.guidedToursService.isTourRunning()) {
          activeTourName = "";
          $window.sessionStorage.removeItem(TOUR_NAME_KEY);
        } else {
          activeTourName = $window.sessionStorage.getItem(TOUR_NAME_KEY);
        }
        return activeTourName;
      }

      function normalizeUrlCompare(url1, url2) {
        if (!url1 || !url2)
          return -1;
        else
          return normalizeUrl(url1).indexOf(normalizeUrl(url2));
      }
      var IGNORE_PARAMS_ON_COMPARE = ['sysparm_list', 'sysparm_list_mode', 'sysparm_nameofstack', 'sysparm_clear_stack', 'sysparm_userpref_module', 'sysparm_offset', 'sysparm_first_row', 'sysparm_view', 'sysparm_query'];

      function normalizeUrl(url) {
        var i = url.indexOf('?');
        if (i === -1)
          return url;
        var path = url.substring(0, i);
        var params = url.substring(i + 1).split('&');
        params.sort();
        var sortedAndUniqueParams = [];
        var lastParamName;
        for (var j = 0; j < params.length; j++) {
          var paramName = getParamName(params[j]);
          if (j > 0 && paramName === lastParamName)
            continue;
          if (IGNORE_PARAMS_ON_COMPARE.indexOf(paramName) === -1)
            sortedAndUniqueParams.push(params[j]);
          lastParamName = paramName;
        }
        url = path + '?' + sortedAndUniqueParams.join('&');
        url = decodeURIComponent(url);
        return url;
      }

      function getParamName(p) {
        var idx = p.indexOf('=');
        if (idx > -1)
          return p.substring(0, idx);
        else
          return p;
      }
    }
  ]);;