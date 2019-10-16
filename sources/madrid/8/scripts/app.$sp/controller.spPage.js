/*! RESOURCE: /scripts/app.$sp/controller.spPage.js */
angular.module("sn.$sp").controller("spPageCtrl", function($scope, $http, $location, $window, spAriaUtil, spUtil, spMetatagService, spAnnouncement,
      snRecordWatcher, $rootScope, spPage, spAriaFocusManager, $timeout, spAtf, spGtd) {
      'use strict';
      var _ = $window._;
      var c = this;
      c.doAnimate = false;
      c.firstPage = true;
      $scope.theme = {};
      $scope.page = {
        title: "Loading..."
      };
      $scope.sessions = {};
      if ($window.NOW.sp_show_console_error) {
        spPage.showBrowserErrors();
      }
      c.parseJSON = function(str) {
        return JSON.parse(str);
      };
      c.getContainerClasses = function(container) {
        var classes = [];
        if (!container.bootstrap_alt) {
          classes[classes.length] = container.width;
        }
        if (container.container_class_name) {
          classes[classes.length] = container.container_class_name;
        }
        return classes;
      };
      var oid = $location.search().id;
      var oldPath = $location.path();
      var locationChanged = false;
      $rootScope.$on('$locationChangeSuccess', function(e, newUrl, oldUrl) {
        locationChanged = (oldUrl != newUrl);
        var s = $location.search();
        var p = $location.path();
        if (oldPath != p) {
          $window.location.href = $location.absUrl();
          return;
        }
        if (angular.isDefined($scope.containers) && oid == s.id && s.spa) {
          return;
        }
        if (spPage.isHashChange(newUrl, oldUrl)) {
          return;
        }
        $scope.$broadcast('$$uiNotification.dismiss');
        if (newUrl = spPage.containsSystemPage(p)) {
          $window.location.href = newUrl;
          return;
        }
        if (!$window.NOW.has_access && locationChanged) {
          $window.location.href = $location.absUrl();
          return;
        }
        oid = s.id;
        getPage();
      });

      function loadPage(r) {
        var response = r.data.result;
        spMetatagService.setTags(response.metatags);
        c.firstPage = false;
        $scope.containers = _.filter(response.containers, {
          'subheader': false
        });
        $scope.subheaders = _.filter(response.containers, {
          'subheader': true
        });
        var p = response.page;
        var u = response.user;
        if (!spPage.