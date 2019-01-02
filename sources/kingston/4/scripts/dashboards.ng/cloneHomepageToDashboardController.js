/*! RESOURCE: /scripts/dashboards.ng/cloneHomepageToDashboardController.js */
angular.module('sn.createDashboardVersion', []).controller('cloneHomepageToDashboardController', ['$window', '$scope', '$http',
  function($window, $scope, $http) {
    'use strict';
    $scope.hideHomepageNotification = false;

    function getHttpParams(method, params) {
      params = params || {};
      return {
        url: 'angular.do',
        params: params,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'X-UserToken': window.g_ck
        }
      }
    }
    $scope.cloneHomepage = function() {
      $http(getHttpParams('get', {
        sysparm_type: 'cloneHomepageProcessor',
        method: 'hasMultipleDashboards'
      })).success(function(data) {
        if ('true' === data) {
          var glideModal = new GlideModal('create_dashboard_version_dialog');
          var glideModalTitle = new GwtMessage().getMessage('Create a Dashboard Version of Homepage');
          glideModal.setTitle(glideModalTitle);
          glideModal.setPreference('onClickCreate', sendRequestToCloneHomepage);
          glideModal.render();
          if ($j('#homepage-settings-popover') && 'none' != $j('#homepage-settings-popover').css('display')) {
            $j("#cog-wheel").popover("hide");
          }
        } else {
          sendRequestToCloneHomepage();
        }
      });
    };

    function sendRequestToCloneHomepage(dashboardSysId) {
      var currentHomepageSysId = glideGrid ? glideGrid.getProperty('sys_id') : '';
      var widgetsSpecs = prepareWidgetSpecs();
      var requestParams = {
        sysparm_type: 'cloneHomepageProcessor',
        currentHomepageSysId: currentHomepageSysId,
        widgetsSpecs: JSON.stringify(widgetsSpecs),
        method: 'createNewDashboard'
      };
      var redirectLink = "$pa_dashboard.do?sysparm_dashboard=";
      if (dashboardSysId) {
        requestParams['dashboardSysId'] = dashboardSysId;
        requestParams['method'] = 'addToExistingDashboard';
      }
      $http(getHttpParams('get', requestParams)).success(function(data) {
        if (data.status !== 'Error') {
          if (dashboardSysId) {
            redirectLink += dashboardSysId;
          } else {
            redirectLink += data.newDashboardSysId;
          }
          redirectLink += "&sysparm_pa_dashboard_redirect_action=true&sysparm_dashboard_version_of_homepage=true";
          if (data.paDashboardGuidedTourSysId) {
            redirectLink += "&sysparm_pa_dashboard_guided_tour=" + data.paDashboardGuidedTourSysId;
          }
          if (data.newTabSysId) {
            redirectLink += "&sysparm_tab=" + data.newTabSysId;
          }
          $window.location.href = redirectLink;
        }
      });
    }

    function prepareWidgetSpecs() {
      var widgetsSpecs = [],
        tableWidth = $j("#homepage_grid").width();
      var floatingDivs = $j('.glide-grid-block').not('#homepage_grid .glide-grid-block').get();
      if (floatingDivs.length > 0) {
        tableWidth += $j(floatingDivs[0]).width();
      }
      $j('.glide-grid-block').each(function(index, widget) {
        widget = $j(widget);
        var dropzone = widget.parent().attr('id');
        widgetsSpecs.push({
          width: widget.width() / tableWidth,
          height: widget.height(),
          dropzone: dropzone
        });
      });
      return widgetsSpecs;
    };
    $scope.dontAskMeAgain = function() {
      $scope.hideHomepageNotification = true;
      $http(getHttpParams('post', {
        sysparm_type: 'cloneHomepageProcessor',
        method: 'dontAskMeAgain'
      })).success(function() {
        $j('#hintCreateDashboardVersion').popover('show');
      });
    };
    $scope.remindMeLater = function() {
      $scope.hideHomepageNotification = true;
      $http(getHttpParams('post', {
        sysparm_type: 'cloneHomepageProcessor',
        method: 'remindMeLater'
      })).success(function(data) {});
    };
  }
]);
angular.element(document).ready(function() {
  var element = angular.element(document.getElementById('createDashboardVersionBanner'));
  var isInitialized = element.injector();
  if (!isInitialized)
    angular.bootstrap(element, ['sn.createDashboardVersion']);
});;