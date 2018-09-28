/*! RESOURCE: /scripts/app.magellan/fast/directive.concourseApplicationTree.js */
angular.module('Magellan').directive('concourseApplicationTree', function(
      $q,
      $timeout,
      getTemplateUrl,
      $rootScope,
      concourseNavigatorService,
      $window,
      i18n
    ) {
      'use strict';
      var DEBUG_LOG = 'concourseApplicationTree';
      var DEBUG_METRICS = concourseNavigatorService.DEBUG_METRICS;
      var TYPE_APP = 'APP';
      var TYPE_MODULE = 'MODULE';
      var TYPE_SEPARATOR = 'SEPARATOR';
      var TYPE_PARENT = 'PARENT';
      var ITEM_HEIGHT = 40;
      return {
        restrict: 'E',
        templateUrl: getTemplateUrl('concourse_application_tree.xml'),
        scope: {},
        controller: function($scope) {
            var CLIENT_HEIGHT = _getClientHeight();
            var applicationHeights = {};
            var applicationScrollTop = [];
            $scope.renderApplicationsOnScreen = renderApplicationsOnScreen;
            $scope.renderAllApplications = renderAllApplications;
            $scope.closeAllApplications = closeAllApplications;
            $scope.isMaxScroll = isMaxScroll;
            $scope.getApplicationStyles = getApplicationStyles;
            $scope.getModuleDisplayType = _getModuleDisplayType;
            $scope.canEdit = concourseNavigatorService.canEdit;
            $scope.delegateTreeClick = function($event) {
              var $target = angular.element($event.target);
              if ($target.hasClass('app-node') || $target.parent().hasClass('app-node')) {
                var scope = $target.scope();
                if (scope.application) {
                  scope.application.inView = true;
                  _initializeLazyRender($scope.applications);
                  $timeout(function() {
                    renderApplicationsOnScreen();
                  });
                }
              }
            };

            function getApplicationStyles(app) {
              var min = getApplicationMinHeight(app);
              return min > ITEM_HEIGHT ? {
                minHeight: min
              } : {};
            }

            function getApplicationMinHeight(app) {
              if (app.open && !app.inView) {
                var moduleCount = app.modules.length;
                return ITEM_HEIGHT + moduleCount * ITEM_HEIGHT;
              }
              return ITEM_HEIGHT;
            }

            function isMaxScroll(top) {
              return top > applicationScrollTop[applicationScrollTop.length - 1] - CLIENT_HEIGHT;
            }
            var lastScrollTop = 0;

            function renderApplicationsOnScreen(scrollTop) {
              if (!$scope.applications) {
                return;
              }
              if (angular.isUndefined(scrollTop)) {
                scrollTop = lastScrollTop;
              } else {
                lastScrollTop = scrollTop;
              }
              var FUDGE = CLIENT_HEIGHT * 2;
              var toRender = [];
              for (var i = 0, iM = applicationScrollTop.length; i < iM; i++) {
                if (scrollTop > applicationScrollTop[i] - FUDGE) {
                  var app = $scope.applications[i];
                  if (app.open && !app.inView) {
                    toRender.push(app);
                  }
                }
              }
              _renderMissingApplications(toRender);
            }

            function renderAllApplications() {
              if (!$scope.applications) {
                return $q.when(true);
              }
              return _renderMissingApplications($scope.applications, true).then(function() {
                return $timeout(angular.noop);
              });
            }

            function closeAllApplications() {
              if (!$scope.applications) {
                return $q.when(true);
              }
              return $timeout(function() {
                $scope.applications.forEach(function(app) {
                  app.open = false;
                });
              });
            }
            concourseNavigatorService.onChangeApps(function(newTree) {
              _initializeLazyRender(newTree);
              _renderTree(newTree);
            });

            function _initializeLazyRender(t) {
              DEBUG_METRICS && console.time(DEBUG_LOG + ':Init lazy render');
              var scrollTop = 0;
              t.forEach(function(app, index) {
                var counts = concourseNavigatorService.getVisibleModuleCountByType(app);
                var applicationHeight = ITEM_HEIGHT + (counts.modules * ITEM_HEIGHT);
                applicationScrollTop[index] = scrollTop;
                scrollTop += applicationHeights[index] = applicationHeight;
              });
              for (var i = 0, iM = t.length; i < iM; i++) {
                t[i].inView = true;
              }
              DEBUG_METRICS && console.timeEnd(DEBUG_LOG + ':Init lazy render');
            }

            function _getClientHeight() {
              var clientHeight;
              if (typeof document.documentElement !== 'undefined') {
                clientHeight = document.documentElement.clientHeight;
              }
              if (typeof clientHeight === 'undefined') {
                clientHeight = 1024;
              }
              return clientHeight;
            }

            function _renderTree(t) {
              DEBUG_METRICS && console.time(DEBUG_LOG + ':Render');
              $scope.applications = t;
              buildAppTree();
              DEBUG_METRICS && console.timeEnd(DEBUG_LOG + ':Render');
              $rootScope.$emit('applicationTree.rendered');
            }
            var FRAME_SIZE = 200;
            concourseNavigatorService.onChangeVisibility(function(result) {
                  var itemsVisibility = result.items;
                  var apps = result.apps;
                  _renderMissingApplications(apps, tru