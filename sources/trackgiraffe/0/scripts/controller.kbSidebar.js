/*! RESOURCE: /scripts/controller.kbSidebar.js */
angular.module('sn.knowledge_block_sidebar').controller(
  'kbSidebar',
  [
    '$scope',
    '$rootScope',
    'snCustomEvent',
    'embeddedHelpService',
    'userPreferences',
    'paneManager',
    function($scope, $rootScope, snCustomEvent,
      embeddedHelpService, userPreferences,
      paneManager) {
      "use strict";
      $scope.kbSidebarCollapsed = true;
      $scope.loaded = false;
      $scope.content = '';
      $scope.actions = [];
      $scope.supressedTours = [];
      $scope.tours = [];
      $scope.showLanguageWarning = false;
      $scope.sysId = "";
      $scope.tableName = "";
      $scope.currentUrl = "";
      $scope.firstLoad = true;
      $scope.knowledgeBase = "";
      $scope.languageArticle = "";
      $scope.slidePanelOpen = false;
      paneManager.registerPane("kb_sidebar_pane");
      snCustomEvent.on('sn:kb_changed', function(data) {
        $scope.knowledgeBase = data;
        $rootScope.$broadcast('sn:kb_changed', data);
      });
      snCustomEvent.on('sn:kb_languageChanged', function(data) {
        $scope.languageArticle = data;
        $rootScope.$broadcast('sn:kb_languageChanged', data);
      });
      snCustomEvent.on("sn:kb_trigger_sidebar",
        function(args) {
          $scope.firstLoad = false;
          $scope.slidePanelOpen = true;
          paneManager.togglePane(
            "kb_sidebar_pane",
            $scope.kbSidebarCollapsed);
          if (args.knowledgeBase != $scope.knowledgeBase) {
            $scope.knowledgeBase = args.knowledgeBase;
          }
          $scope.$broadcast('sn:kb_changed', $scope.knowledgeBase);
          if (args.languageArticle != $scope.languageArticle) {
            $scope.languageArticle = args.languageArticle;
          }
          $scope.$broadcast('sn:kb_languageChanged', $scope.languageArticle);
          $scope.$broadcast('sn:kb_sildePanelRefresh');
        });
      snCustomEvent.on("sn:kb_sidebar_collapse",
        function() {
          if ($scope.slidePanelOpen)
            paneManager.togglePane(
              "kb_sidebar_pane",
              true);
        });
      snCustomEvent.observe('kb_sidebar_pane.toggle',
        function(collapsed,
          autoFocusFirstItem) {
          if (!$scope.kbSidebarCollapsed)
            $scope.slidePanelOpen = false;
          if ($scope.firstLoad == false) {
            $scope.kbSidebarCollapsed = !$scope.kbSidebarCollapsed;
            $rootScope.$broadcast('kb_sidebar_pane.collapsed',
              'right',
              $scope.kbSidebarCollapsed,
              autoFocusFirstItem);
          } else
            $rootScope.$broadcast('kb_sidebar_pane.collapsed',
              'right',
              true,
              autoFocusFirstItem);
        });
      $scope.$on('kb_sidebar_pane.collapsed',
        function(event, position,
          collapsed,
          autoFocusFirstItem) {
          var $body = angular
            .element('body');
          if ($body.data().layout) {
            if (collapsed)
              $body.data().layout
              .hide('east');
            else {
              $body.data().layout
                .show('east');
              $body.data().layout
                .sizePane(
                  'east',
                  285);
            }
          } else {
            var $layout = angular
              .element('.navpage-layout'),
              $pageRight = angular
              .element('.navpage-right'),
              $snkbSidebarContent = angular
              .element('.sn-kb-sidebar-pane-content');
            if (collapsed) {
              $layout.addClass('navpage-right-hidden');
              $pageRight.css('visibility', 'hidden');
              $snkbSidebarContent.addClass('sn-pane-hidden');
              $snkbSidebarContent.removeClass('sn-pane-visible');
            } else {
              $layout.removeClass('navpage-right-hidden');
              $pageRight.css('visibility', 'visible');
              $snkbSidebarContent.removeClass('sn-pane-hidden');
              $snkbSidebarContent.addClass('sn-pane-visible');
            }
            if (autoFocusFirstItem) {
              $snkbSidebarContent.one('transitionend',
                function() {
                  if ($snkbSidebarContent.hasClass('sn-pane-visible')) {
                    $snkbSidebarContent.find('.sn-widget-list-item')
                      .filter(':visible')
                      .filter(':first')
                      .focus();
                  }
                });
            }
          }
        });
    }
  ]);;