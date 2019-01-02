/*! RESOURCE: /scripts/app.embedded_help/controller.embeddedHelp.js */
angular.module('sn.embedded_help').controller('embeddedHelp',
  ['$scope', '$sce', '$rootScope', '$timeout', '$http', '$window', 'snCustomEvent', 'embeddedHelpService', 'userPreferences', 'paneManager',
    function($scope, $sce, $rootScope, $timeout, $http, $window, snCustomEvent, embeddedHelpService, userPreferences, paneManager) {
      "use strict";
      $scope.helpPaneCollapsed = true;
      $scope.loaded = false;
      $scope.content = '';
      $scope.actions = [];
      $scope.supressedTours = [];
      $scope.tours = [];
      $scope.showLanguageWarning = false;
      $scope.showAddHelpArticle = false;
      $scope.editArticleLink = '';
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
          sysid: '',
          content: '',
          default_language: false,
          add_help_card: false,
          actions: [],
          tours: []
        }
        if (typeof result != 'undefined' && result.length > 0) {
          for (var i = 0; i < result.length; i++) {
            if (result[i].type === 'content') {
              parsedResult.content = result[i].content;
              parsedResult.sysid = result[i].fSysId;
              parsedResult.default_language = result[i].default_language;
              parsedResult.add_help_card = result[i].add_help_card;
            } else if (result[i].type === 'tour') {
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
        $scope.showAddHelpArticle = parsedResult.add_help_card && !parsedResult.content;
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