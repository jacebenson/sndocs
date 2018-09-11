/*! RESOURCE: /scripts/app.magellan/fast/directive.concourseApplicationTree.js */
angular.module('Magellan').directive('concourseApplicationTree', function(
  $q,
  $timeout,
  getTemplateUrl,
  $rootScope,
  concourseNavigatorService,
  $window
) {
  'use strict';
  var DEBUG_LOG = 'concourseApplicationTree';
  var DEBUG_METRICS = concourseNavigatorService.DEBUG_METRICS;
  var TYPE_APP = 'APP';
  var TYPE_MODULE = 'MODULE';
  var TYPE_SEPARATOR = 'SEPARATOR';
  var TYPE_PARENT = 'PARENT';
  var RENDER_FULL_TREE_DELAY = 75;
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
        var height = 0;
        for (var i = 0, iM = t.length; i < iM; i++) {
          if (height > CLIENT_HEIGHT) {
            break;
          }
          if (t[i].open) {
            t[i].inView = true;
          }
          height += applicationHeights[i];
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
        return $timeout(function() {
          DEBUG_METRICS && console.timeEnd(DEBUG_LOG + ':Render');
          $rootScope.$emit('applicationTree.rendered');
        });
      }
      var FRAME_SIZE = 200;
      concourseNavigatorService.onChangeVisibility(function(result) {
        var itemsVisibility = result.items;
        var apps = result.apps;
        _renderMissingApplications(apps, true).then(function() {
          for (var i = 0, iM = itemsVisibility.length;
            (i * FRAME_SIZE) < iM; i++) {
            (function(frameIndex) {
              $window.requestAnimationFrame(function() {
                DEBUG_METRICS && console.time(DEBUG_LOG + ':Render frame #' + frameIndex);
                _updateFrameVisibility(itemsVisibility, frameIndex, FRAME_SIZE);
                DEBUG_METRICS && console.timeEnd(DEBUG_LOG + ':Render frame #' + frameIndex);
              });
            })(i);
          }
          _focusFirstItem();
        });
      });

      function _renderMissingApplications(apps, verifyInview) {
        DEBUG_METRICS && console.time(DEBUG_LOG + ':Render missing applications');
        if (verifyInview) {
          var missing = [];
          apps.forEach(function(app) {
            if (!app.inView) {
              missing.push(app);
            }
          });
          apps = missing;
        }
        if (apps.length > 0) {
          return $timeout(function() {
            apps.forEach(function(app) {
              app.inView = true;
            });
            $timeout(function() {
              DEBUG_METRICS && console.timeEnd(DEBUG_LOG + ':Render missing applications');
            });
          });
        } else {
          DEBUG_METRICS && console.timeEnd(DEBUG_LOG + ':Render missing applications');
          return $q.when(true);
        }
      }
      var _$navRoot;

      function _focusFirstItem() {
        if (!_$navRoot) {
          _$navRoot = $window.jQuery('#gsft_nav');
        }
        $timeout(function() {
          $window.requestAnimationFrame(function() {
            _$navRoot.find('.state-active').removeClass('state-active');
            var $visibleItems = _$navRoot.find('a.sn-widget-list-item:visible');
            if ($visibleItems.length) {
              $visibleItems.eq(0).addClass('state-active');
            }
          });
        }, 100);
      }

      function _updateFrameVisibility(itemsVisibility, frameIndex, frameSize) {
        var itemVisibility;
        var itemKey;
        var $el;
        var $firstChild;
        var el;
        var elDisplay;
        for (var i = frameIndex * frameSize, iM = i + frameSize; i < iM; i++) {
          itemVisibility = itemsVisibility[i];
          if (!itemVisibility) {
            return;
          }
          itemKey = (itemVisibility.id || "").split("_").pop();
          concourseNavigatorService.setVisibilityForKey(itemKey, itemVisibility.visible);
          $el = angular.element('#' + itemVisibility.id);
          switch (itemVisibility.type) {
            case TYPE_APP:
              _setMenuState($el, itemVisibility.open);
              break;
            case TYPE_PARENT:
              $firstChild = $el.children('div');
              _setMenuState($firstChild, itemVisibility.open);
              break;
          }
          el = $el[0];
          if (!el) {
            continue;
          }
          elDisplay = itemVisibility.visible ? '' : 'none';
          el.style.display = elDisplay;
        }
      }

      function _setMenuState($el, isOpen) {
        if (isOpen) {
          $el.children('a.collapsed').removeClass('collapsed').addClass('nav-open-state');
          $el.children('ul.collapse').addClass('in').css('height', '');
        } else {
          $el.children('a.nav-open-state').removeClass('nav-open-state').addClass('collapsed');
          $el.children('ul.collapse').removeClass('in').css('height', '0px');
        }
      }

      function _getModuleDisplayType(module) {
        switch (module.type) {
          case TYPE_SEPARATOR:
            return 'NONE';
          case TYPE_APP:
            return TYPE_APP;
          case TYPE_PARENT:
            return TYPE_PARENT;
          default:
            return TYPE_MODULE;
        }
      }
    },
    link: function(scope, element) {
      var $scrollContainer = angular.element('#nav_west_center');
      var maxScroll = 0;
      $scrollContainer.on('scroll', scrollHandler);

      function unbindScrollHandler() {
        $scrollContainer.off('scroll', scrollHandler);
      }

      function scrollHandler(e) {
        var top = $scrollContainer.scrollTop();
        if (top > maxScroll) {
          maxScroll = top;
          scope.renderApplicationsOnScreen(top);
          if (scope.isMaxScroll(top)) {
            unbindScrollHandler();
          }
        }
      }
      angular.element(element).on('show.bs.collapse', function(e) {
        var $this = angular.element(e.target).siblings('[data-sn-toggle="collapse"]');
        $this.addClass('nav-open-state');
        $this.attr('aria-expanded', 'true');
        var type = $this.hasClass('app-node') ? TYPE_APP : TYPE_PARENT;
        var id = $this.data('id');
        concourseNavigatorService.setOpenState(type, id, true);
      });
      angular.element(element).on('hide.bs.collapse', function(e) {
        var $this = angular.element(e.target).siblings('[data-sn-toggle="collapse"]');
        $this.removeClass('nav-open-state');
        $this.attr('aria-expanded', 'false');
        var type = $this.hasClass('app-node') ? TYPE_APP : TYPE_PARENT;
        var id = $this.data('id');
        concourseNavigatorService.setOpenState(type, id, false);
      });
    }
  };
});;