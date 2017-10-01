/*! RESOURCE: /scripts/app.embedded_help/js_embedded_help_includes.js */
/*! RESOURCE: /scripts/app.embedded_help/app_embedded_help.js */
angular.module('sn.embedded_help', [
    'sn.base',
    'ng.common',
    'ngSanitize',
    'sn.i18n'
]);;
/*! RESOURCE: /scripts/app.embedded_help/constants_embedded_help.js */
var EmbeddedHelpEvents = {};
EmbeddedHelpEvents.GUIDED_SETUP_ENABLE = "embedded_help.guided_setup.enable";
EmbeddedHelpEvents.GUIDED_SETUP_DISABLE = "embedded_help.guided_setup.disable";
EmbeddedHelpEvents.GUIDED_SETUP_ACTIONS_CHANGE = "embedded_help.guided_setup.actions_change";
EmbeddedHelpEvents.GUIDED_SETUP_ACTION_COMPLETE = "guided_setup:complete";
EmbeddedHelpEvents.GUIDED_SETUP_ACTION_INCOMPLETE = "guided_setup:incomplete";
EmbeddedHelpEvents.GUIDED_SETUP_ACTION_SKIP = "guided_setup:skip";
EmbeddedHelpEvents.GUIDED_SETUP_ACTION_EXIT = "guided_setup:exit";
EmbeddedHelpEvents.GUIDED_SETUP_ACTION_BACK = "guided_setup:back";
EmbeddedHelpEvents.TOUR_START = "embedded_help:tour.start";
EmbeddedHelpEvents.TOUR_END = "embedded_help:tour.end"
EmbeddedHelpEvents.TOUR_STATE = "embedded_help:tour:state"
EmbeddedHelpEvents.HOPSCOTCH_TOUR_START = "hopscotch.tour.start";
EmbeddedHelpEvents.HOPSCOTCH_TOUR_END = "hopscotch.tour.end";
EmbeddedHelpEvents.PANE_NAME = "embedded_help:help_pane";
EmbeddedHelpEvents.PANE_STATE = "embedded_help:help_pane:state";
EmbeddedHelpEvents.PANE_TOGGLE = "embedded_help:help_pane.toggle";
EmbeddedHelpEvents.PANE_LOAD = "magellanNavigator.permalink.set";
EmbeddedHelpEvents.CONTENT_LOAD = "embedded_help:content.load";
EmbeddedHelpEvents.DOCUMENT_LINK_CHANGE = "embedded_help:document_link.change";
EmbeddedHelpEvents.LOAD_EMBEDDED_HELP = "embedded_help:load_embedded_help";;
/*! RESOURCE: /scripts/app.embedded_help/service.embeddedHelpService.js */
angular.module('sn.embedded_help').service('embeddedHelpService', ['$rootScope', '$http', '$q', '$window', '$location', '$cacheFactory', 'snCustomEvent', 'autoClosePane', 'persistGuidedSetupActions', 'helpUrl',
    function($rootScope, $http, $q, $window, $location, $cacheFactory, snCustomEvent, autoClosePane, persistGuidedSetupActions, helpUrl) {
        "use strict";
        var TOUR_SYS_ID_KEY = "embedded_help:tour:sys_id";
        var TOUR_NAME_KEY = "embedded_help:tour:name";
        var GUIDED_SETUP_CONFIG_KEY = "embedded_help:guided_setup:config";
        var DEFAULT_DOCUMENTATION_LINK = 'context_help.do';
        var resultCache = $cacheFactory('embedded_help_results');
        var documentationLink = helpUrl || DEFAULT_DOCUMENTATION_LINK;
        var page = "";
        var qualifier = "";
        var modifier = "normal";
        var guidedSetupConfig = getGuidedSetupConfig();
        var activeTourSysId = getActiveTourSysId();
        var activeTourName = getActiveTourName();
        var queryString = "";
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
                top.NOW.guidedToursService.startTour(tour_sys_id, 0);
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
        var IGNORE_PARAMS_ON_COMPARE = ['sysparm_list', 'sysparm_list_mode', 'sysparm_nameofstack', 'sysparm_clear_stack', 'sysparm_userpref_module', 'sysparm_offset'];

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
/*! RESOURCE: /scripts/app.embedded_help/controller.embeddedHelp.js */
angular.module('sn.embedded_help').controller('embeddedHelp', ['$scope', '$sce', '$rootScope', '$timeout', '$http', '$window', 'snCustomEvent', 'embeddedHelpService', 'userPreferences', 'paneManager',
    function($scope, $sce, $rootScope, $timeout, $http, $window, snCustomEvent, embeddedHelpService, userPreferences, paneManager) {
        "use strict";
        $scope.helpPaneCollapsed = true;
        $scope.loaded = false;
        $scope.content = '';
        $scope.actions = [];
        $scope.supressedTours = [];
        $scope.tours = [];
        $scope.showLanguageWarning = false;
        paneManager.registerPane(EmbeddedHelpEvents.PANE_NAME);
        userPreferences.getPreference('embedded_help:language_warning.suppress').then(function(value) {
            $scope.suppressLanguageWarning = value !== 'false';
        });
        snCustomEvent.observe(EmbeddedHelpEvents.GUIDED_SETUP_ENABLE, function(param) {
            embeddedHelpService.enableGuidedSetup(param);
            refreshEmbeddedHelp();
            $scope.$broadcast('help_pane.toggle_collapsed_state', false);
        });
        snCustomEvent.observe(EmbeddedHelpEvents.GUIDED_SETUP_DISABLE, function() {
            embeddedHelpService.disableGuidedSetup();
            refreshEmbeddedHelp();
        });
        snCustomEvent.observe(EmbeddedHelpEvents.TOUR_START, function(tour_sys_id) {
            embeddedHelpService.startTour(tour_sys_id);
        });
        snCustomEvent.observe(EmbeddedHelpEvents.TOUR_END, function() {
            embeddedHelpService.endTour();
            refreshEmbeddedHelp();
        });
        snCustomEvent.observe(EmbeddedHelpEvents.LOAD_EMBEDDED_HELP, function(qualifier) {
            embeddedHelpService.setQualifier(qualifier);
            refreshEmbeddedHelp();
            $scope.$broadcast('help_pane.toggle_collapsed_state', false);
        });
        snCustomEvent.observe(EmbeddedHelpEvents.PANE_LOAD, function(response) {
            var page = embeddedHelpService.locationChange(response.relativePath);
            if (page)
                refreshEmbeddedHelp();
        });

        function refreshEmbeddedHelp() {
            $scope.loaded = false;
            embeddedHelpService.retrievePageDoc().then(function success(response) {
                if (response && response.result)
                    processEmbeddedHelp(response.result);
            }, function error(response) {
                console.error("Error retrieving embedded help content.  " + angular.toJson(response));
            }).finally(function() {
                $scope.loaded = true;
            });
        }

        function processEmbeddedHelp(result) {
            var parsedResult = {
                content: '',
                default_language: false,
                actions: [],
                tours: []
            }
            if (typeof result != 'undefined' && result.length > 0) {
                parsedResult.content = result[0].content;
                parsedResult.default_language = result[0].default_language;
                for (var i = 1; i < result.length; i++) {
                    if (result[i].type === 'tour') {
                        parsedResult.tours.push(result[i]);
                    } else if (result[i].type === 'action') {
                        result[i].onClick = result[i].onClick.replace(/"'/g, '&quot;');
                        parsedResult.actions.push(result[i]);
                    } else {
                        console.error("Unknown embedded help content type: " + result[i].type);
                    }
                }
            }
            $scope.content = $sce.trustAsHtml(parsedResult.content);
            $scope.supressedTours = parsedResult.tours;
            $scope.showLanguageWarning = !$scope.suppressLanguageWarning && ($window.NOW.language != 'en' && parsedResult.default_language);
            var AUTOSTART = $window.sessionStorage.getItem('AUTOSTART');
            var TOURNAME = $window.sessionStorage.getItem('TOURNAME');
            if (AUTOSTART != null) {
                var activeTourSysId = AUTOSTART;
                var activeTourName = TOURNAME;
                embeddedHelpService.startTour(activeTourSysId, activeTourName);
                $window.sessionStorage.removeItem('AUTOSTART');
                $window.sessionStorage.removeItem('TOURNAME');
            } else {
                var activeTourSysID = embeddedHelpService.getActiveTourSysId();
            }
            if (activeTourSysID) {
                $scope.tours = [{
                    sysID: activeTourSysID
                }];
            } else {
                $scope.tours = parsedResult.tours;
            }
            snCustomEvent.fireTop(EmbeddedHelpEvents.CONTENT_LOAD, typeof $scope.content !== 'undefined' && $scope.content != '');
        }
        $rootScope.$on(EmbeddedHelpEvents.TOUR_STATE, function(event, activeTourSysId) {
            if (!activeTourSysId)
                refreshEmbeddedHelp();
        });
        $scope.$on('help_pane.toggle_collapsed_state', function(event, collapsedState) {
            if ($scope.helpPaneCollapsed !== collapsedState)
                paneManager.togglePane(EmbeddedHelpEvents.PANE_NAME);
        });
        $rootScope.$broadcast('help_pane.collapsed', 'right', $scope.helpPaneCollapsed, false);
        snCustomEvent.observe(EmbeddedHelpEvents.PANE_TOGGLE, function(collapsed, autoFocusFirstItem) {
            $scope.helpPaneCollapsed = !$scope.helpPaneCollapsed;
            $rootScope.$broadcast('help_pane.collapsed', 'right', $scope.helpPaneCollapsed, autoFocusFirstItem);
        });
        $scope.$watch('helpPaneCollapsed', function(listCollapsed) {
            snCustomEvent.fireTop(EmbeddedHelpEvents.PANE_STATE, (listCollapsed) ? 'closed' : 'open');
        });
        $scope.$on('help_pane.collapsed', function(event, position, collapsed, autoFocusFirstItem) {
            var $body = angular.element('body');
            if ($body.data().layout) {
                if (collapsed) {
                    $body.data().layout.hide('east');
                } else {
                    $body.data().layout.show('east');
                    $body.data().layout.sizePane('east', 285);
                }
            } else {
                var $layout = angular.element('.navpage-layout'),
                    $pageRight = angular.element('.navpage-right'),
                    $snEmbeddedHelp = angular.element('.sn-embedded-help-content');
                if (collapsed) {
                    $layout.addClass('navpage-right-hidden');
                    $pageRight.css('visibility', 'hidden');
                    $snEmbeddedHelp.addClass('sn-pane-hidden');
                    $snEmbeddedHelp.removeClass('sn-pane-visible');
                } else {
                    $layout.removeClass('navpage-right-hidden');
                    $pageRight.css('visibility', 'visible');
                    $snEmbeddedHelp.removeClass('sn-pane-hidden');
                    $snEmbeddedHelp.addClass('sn-pane-visible');
                }
                if (autoFocusFirstItem) {
                    $snEmbeddedHelp.one('transitionend', function() {
                        if ($snEmbeddedHelp.hasClass('sn-pane-visible')) {
                            $snEmbeddedHelp.find('.sn-widget-list-item')
                                .filter(':visible')
                                .filter(':first')
                                .focus();
                        }
                    });
                }
            }
        });
        $scope.$on('language-warning.confirmed', function(event, suppressLanguageWarning) {
            if (suppressLanguageWarning) {
                userPreferences.setPreference('embedded_help:language_warning.suppress', true);
                $scope.suppressLanguageWarning = true;
            }
            $scope.showLanguageWarning = false;
        });
    }
]);;
/*! RESOURCE: /scripts/app.embedded_help/directive.embeddedHelpBarToggle.js */
angular.module('sn.embedded_help').directive('embeddedHelpBarToggle', ['getTemplateUrl',
    function(getTemplateUrl) {
        "use strict";
        return {
            templateUrl: getTemplateUrl('embedded_help_bar_toggle.xml'),
            restrict: 'E',
            replace: true,
            scope: {
                state: '&'
            },
            controller: ['$scope', 'snCustomEvent', 'paneManager', function($scope, snCustomEvent, paneManager) {
                $scope.state = "closed";
                $scope.contentExists = false;
                $scope.toggleHelpPane = function() {
                    paneManager.togglePane(EmbeddedHelpEvents.PANE_NAME, true);
                };
                snCustomEvent.observe(EmbeddedHelpEvents.PANE_STATE, function(openState) {
                    $scope.state = openState;
                });
                snCustomEvent.observe(EmbeddedHelpEvents.CONTENT_LOAD, function(contentExists) {
                    $scope.contentExists = contentExists;
                });
            }],
            link: function(scope, element) {
                scope.$on('help_pane.collapsed', function($event, position, isCollapsed, autoFocus) {
                    if (isCollapsed && autoFocus) {
                        element.focus();
                    }
                });
            }
        }
    }
]);;
/*! RESOURCE: /scripts/app.embedded_help/directive.snEmbeddedHelpPane.js */
angular.module('sn.embedded_help').directive('snEmbeddedHelpPane', function($timeout, getTemplateUrl, paneManager) {
    'use strict';
    return {
        restrict: 'E',
        replace: true,
        transclude: true,
        templateUrl: getTemplateUrl('sn_embedded_help_pane.xml'),
        scope: {
            paneCollapsed: '=',
            panePosition: '@',
            paneResizeable: '@',
            paneWidth: '=',
            paneToggle: '@'
        },
        link: function(scope, element) {
            var scrollPromise;
            var mouseHeldDown = false;
            var mouseClicked = true;
            scope.$watch('paneWidth', function() {
                if (scope.paneWidth) {
                    element.width(scope.paneWidth);
                }
            });
            scope.isMobile = function() {
                return angular.element('html').width() <= 800;
            };
            scope.scrollMousedown = function(moveBy) {
                scrollPromise = $timeout(function() {
                    mouseHeldDown = true;
                    mouseClicked = false;
                    updateScrollPosition(moveBy);
                }, 300);
            };
            scope.scrollMouseup = function() {
                $timeout.cancel(scrollPromise);
                scrollPromise = void(0);
                if (!mouseClicked) {
                    mouseHeldDown = false;
                }
            };
            scope.scrollUpCick = function() {
                if (mouseClicked) {
                    var scrollContainer = element.find('.pane-scroll-container');
                    updateScrollPosition(-scrollContainer.height());
                }
                mouseClicked = true;
                mouseHeldDown = false;
            };
            scope.scrollDownCick = function() {
                if (mouseClicked) {
                    var scrollContainer = element.find('.pane-scroll-container');
                    updateScrollPosition(scrollContainer.height());
                }
                mouseClicked = true;
                mouseHeldDown = false;
            };
            scope.actionClick = function(expression) {
                expression = expression.replace(/&quot;/g, '\'');
                return eval(expression);
            }

            function updateScrollPosition(moveBy) {
                var scrollContainer = element.find('.pane-scroll-container');
                scrollContainer.animate({
                    scrollTop: scrollContainer[0].scrollTop + moveBy
                }, 300, 'linear', function() {
                    if (mouseHeldDown) {
                        updateScrollPosition(moveBy);
                    }
                });
            }

            function updateScrollButtons() {
                var scrollContainer = element.find('.pane-scroll-container');
                if (scope.paneCollapsed && !scope.isMobile() && scrollContainer.get(0)) {
                    if (scrollContainer.outerHeight() < scrollContainer.get(0).scrollHeight) {} else {}
                } else {}
            }
            scope.toggleHelpPane = function() {
                paneManager.togglePane(EmbeddedHelpEvents.PANE_NAME, true);
                updateScrollButtons();
            }
            angular.element(window).on('resize', function() {
                updateScrollButtons();
            });
            $timeout(updateScrollButtons);
        }
    };
});;
/*! RESOURCE: /scripts/app.embedded_help/directive.snEmbeddedHelpContent.js */
angular.module('sn.embedded_help').directive('snEmbeddedHelpContent', function(getTemplateUrl) {
    'use strict';
    return {
        restrict: 'E',
        templateUrl: getTemplateUrl('sn_embedded_help_content.xml'),
        replace: true,
        scope: {
            collapsed: '='
        },
        link: function(scope, element) {
            element.removeClass("loading");
        },
        controller: function($scope) {
            $scope.suppressLanguageWarning = {
                suppress: false
            };
            $scope.onConfirmLanguageWarningClick = function() {
                $scope.$emit('language-warning.confirmed', $scope.suppressLanguageWarning.suppress);
            }
        }
    };
});;
/*! RESOURCE: /scripts/app.embedded_help/directive.snEmbeddedHelpActionList.js */
angular.module('sn.embedded_help').directive('snEmbeddedHelpActionList', ['getTemplateUrl',
    function(getTemplateUrl) {
        "use strict";
        return {
            templateUrl: getTemplateUrl('sn_embedded_help_action_list.xml'),
            restrict: 'E',
            replace: true,
            controller: ['$scope', '$rootScope', 'embeddedHelpService', function($scope, $rootScope, embeddedHelpService) {
                $scope.helpEvents = EmbeddedHelpEvents;
                $scope.activeTourSysId = embeddedHelpService.getActiveTourSysId();
                $scope.activeTourName = embeddedHelpService.getActiveTourName();
                $scope.guidedSetupConfig = embeddedHelpService.getGuidedSetupConfig();
                $scope.guidedSetupActions = $scope.guidedSetupConfig ? $scope.guidedSetupConfig.actions : [];
                $scope.isGuidedSetupSticky = isGuidedSetupSticky();
                $scope.getTours = function() {
                    return $scope.$parent.tours;
                }
                $scope.startTour = function(tour) {
                    if (tour != null) {
                        embeddedHelpService.startTour(tour.sysID, tour.name);
                        $scope.activeTourName = tour.name;
                    }
                }
                $scope.endTour = function() {
                    embeddedHelpService.endTour();
                }
                $rootScope.$on(EmbeddedHelpEvents.TOUR_STATE_ID, function(event, activeTourSysId) {
                    $scope.activeTourSysId = activeTourSysId;
                });
                $rootScope.$on(EmbeddedHelpEvents.TOUR_STATE_NAME, function(event, activeTourName) {
                    $scope.activeTourName = activeTourName;
                });
                $scope.onGuidedSetupActionClick = function(action) {
                    embeddedHelpService.handleGuidedSetupAction(action);
                }
                $rootScope.$on(EmbeddedHelpEvents.GUIDED_SETUP_ACTIONS_CHANGE, function(event, newGuidedSetupActions) {
                    $scope.guidedSetupActions = newGuidedSetupActions;
                    $scope.isGuidedSetupSticky = isGuidedSetupSticky();
                });
                $scope.onActionClick = function(expression) {
                    expression = expression.replace(/&quot;/g, '\'');
                    return eval(expression);
                }

                function isGuidedSetupSticky() {
                    $scope.guidedSetupConfig = embeddedHelpService.getGuidedSetupConfig();
                    return !angular.equals({}, $scope.guidedSetupConfig);
                }
            }]
        }
    }
]);;
/*! RESOURCE: /scripts/app.embedded_help/directive.snEmbeddedHelpMenu.js */
angular.module('sn.embedded_help').directive('snEmbeddedHelpMenu', ['getTemplateUrl', 'embeddedHelpService',
    function(getTemplateUrl, embeddedHelpService) {
        'use strict';
        return {
            restrict: 'E',
            replace: true,
            scope: {
                isContextMenu: '=',
                label: "@"
            },
            templateUrl: getTemplateUrl('sn_embedded_help_menu.xml'),
            controller: function($scope, $rootScope) {
                $scope.documentationLink = embeddedHelpService.getDocumentationLink();
                $scope.isLeft = g_text_direction == 'ltr';
                $rootScope.$on(EmbeddedHelpEvents.DOCUMENT_LINK_CHANGE, function(event, documentLink) {
                    $scope.documentationLink = documentLink;
                });
            }
        };
    }
]);;;