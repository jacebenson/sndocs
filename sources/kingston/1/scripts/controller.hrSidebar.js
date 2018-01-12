/*! RESOURCE: /scripts/controller.hrSidebar.js */
angular.module('sn.response_template_sidebar').controller('hrSidebar', function($scope, $rootScope, $timeout, $http, $window, $location, $document, snCustomEvent, embeddedHelpService, userPreferences, paneManager) {
  "use strict";
  $scope.hrSidebarCollapsed = true;
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
  paneManager.registerPane("hr_sidebar_pane");
  snCustomEvent.on("sn:hr_trigger_sidebar", function(args) {
    if (args.sysId != $scope.sysId || args.tableName != $scope.tableName) {
      $scope.currentUrl = "/sn_templated_snip_message_template.do?sysparm_sys_id=" + args.sysId + "&sysparm_table_name=" + args.tableName + "&sysparm_nostack=true";
      $scope.sysId = args.sysId;
      $scope.tableName = args.tableName;
    }
    $scope.$broadcast('sn:url_changed', $scope.currentUrl);
    paneManager.togglePane("hr_sidebar_pane", $scope.hrSidebarCollapsed);
    $document[0].getElementById('templateIfame').contentDocument.location.reload(true);
  });
  snCustomEvent.observe('hr_sidebar_pane.toggle', function(collapsed, autoFocusFirstItem) {
    $scope.hrSidebarCollapsed = !$scope.hrSidebarCollapsed;
    $rootScope.$broadcast('hr_sidebar_pane.collapsed', 'right', $scope.hrSidebarCollapsed, autoFocusFirstItem);
    if ($scope.firstLoad) {
      $rootScope.$broadcast('hr_sidebar_pane.collapsed', 'right', true, autoFocusFirstItem);
      $scope.firstLoad = false;
    }
  });
  $scope.$on('hr_sidebar_pane.collapsed', function(event, position, collapsed, autoFocusFirstItem) {
    var $body = angular.element('body');
    if ($body.data().layout) {
      if (collapsed)
        $body.data().layout.hide('east');
      else {
        $body.data().layout.show('east');
        $body.data().layout.sizePane('east', 285);
      }
    } else {
      var $layout = angular.element('.navpage-layout'),
        $pageRight = angular.element('.navpage-right'),
        $snHrSidebarContent = angular.element('.sn-hr-sidebar-pane-content');
      if (collapsed) {
        $layout.addClass('navpage-right-hidden');
        $pageRight.css('visibility', 'hidden');
        $snHrSidebarContent.addClass('sn-pane-hidden');
        $snHrSidebarContent.removeClass('sn-pane-visible');
      } else {
        $layout.removeClass('navpage-right-hidden');
        $pageRight.css('visibility', 'visible');
        $snHrSidebarContent.removeClass('sn-pane-hidden');
        $snHrSidebarContent.addClass('sn-pane-visible');
      }
      if (autoFocusFirstItem) {
        $snHrSidebarContent.one('transitionend', function() {
          if ($snHrSidebarContent.hasClass('sn-pane-visible')) {
            $snHrSidebarContent.find('.sn-widget-list-item')
              .filter(':visible')
              .filter(':first')
              .focus();
          }
        });
      }
    }
  });
});;