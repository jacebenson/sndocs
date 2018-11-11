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

      function setText(elem, value) {
        if (typeof elem.textContent !== "undefined") {
          elem.textContent = value;
        } else {
          elem.innerText = value;
        }
      }
      var APPLICATION_LI_WIDGET = document.createElement('li');
      APPLICATION_LI_WIDGET.className = 'sn-widget';
      var APPLICATION_ANCHOR = document.createElement('a');
      APPLICATION_ANCHOR.className = 'app-node sn-aside-group-title sn-aside-group-title_selectable sn-aside-group-title_nav sn-aside-group-title_hidden nav-application-overwrite';
      APPLICATION_ANCHOR.setAttribute('href', 'javascript:void(0)');
      APPLICATION_ANCHOR.setAttribute('role', 'button');
      APPLICATION_ANCHOR.setAttribute('data-sn-toggle', 'collapse');
      var EDIT_APP_BUTTON = document.createElement('button');
      EDIT_APP_BUTTON.setAttribute('type', 'button');
      EDIT_APP_BUTTON.setAttribute('role', 'link');
      EDIT_APP_BUTTON.className = 'sn-aside-btn btn btn-icon sn-aside-btn_control state-overwrite-hidden icon-edit nav-edit-app nav-app-button app-action-icon-btn';
      EDIT_APP_BUTTON.setAttribute('onclick', 'javascript:void(0)');
      var FAV_APP_BUTTON = document.createElement('button');
      FAV_APP_BUTTON.setAttribute('type', 'button');
      FAV_APP_BUTTON.className = 'sn-aside-btn btn btn-icon sn-aside-btn_control nav-favorite-app nav-app-button app-action-icon-btn';
      var MODULE_LIST_UL = document.createElement('ul');
      MODULE_LIST_UL.className = 'sn-widget-list_v2 sn-widget-list_dense collapse';
      var LI_WIDGET = document.createElement('li');
      var MODULE_DIV_WIDGET = document.createElement('div');
      MODULE_DIV_WIDGET.className = 'sn-widget-list_v2 sn-widget-list_dense';
      var TOGGLE_FOLD_ANCHOR_WIDGET = document.createElement('a');
      TOGGLE_FOLD_ANCHOR_WIDGET.className = 'nav-expandable sn-aside-group-title sn-aside-group-title_selectable sn-aside-group-title_nav';
      TOGGLE_FOLD_ANCHOR_WIDGET.setAttribute('href', 'javascript:void(0)');
      TOGGLE_FOLD_ANCHOR_WIDGET.setAttribute('role', 'button');
      TOGGLE_FOLD_ANCHOR_WIDGET.setAttribute('data-sn-toggle', 'collapse');
      var SIDE_SPAN_WIDGET = document.createElement('span');
      SIDE_SPAN_WIDGET.className = 'sn-aside-btn icon-vcr-right';
      var SUB_MODULE_UL_WIDGET = document.createElement('ul');
      SUB_MODULE_UL_WIDGET.className = 'sn-widget-list_v2 sn-widget-list_dense collapse';
      var EDIT_MODULE_BUTTON = document.createElement('button');
      EDIT_MODULE_BUTTON.className = 'btn btn-icon sn-widget-list-action state-disable-animation icon-edit nav-edit-module module-action-icon-btn';
      EDIT_MODULE_BUTTON.setAttribute('onclick', 'javascript:void(0)');
      EDIT_MODULE_BUTTON.setAttribute('type', 'button');
      EDIT_MODULE_BUTTON.setAttribute('role', 'link');
      EDIT_MODULE_BUTTON.setAttribute('data-dynamic-title', i18n.getMessage('Edit Module'));
      var FAV_MODULE_BUTTON = document.createElement('button');
      FAV_MODULE_BUTTON.className = 'btn btn-icon sn-widget-list-action nav-favorite-module module-action-icon-btn';
      FAV_MODULE_BUTTON.setAttribute('onclick', 'javascript:void(0)');
      FAV_MODULE_BUTTON.setAttribute('type', 'button');

      function buildAppTree() {
        var applicationTree = document.querySelector('#concourse_application_tree');
        applicationTree.innerHTML = '';
        for (var i = 0; i < $scope.applications.length; i++) {
          var application = $scope.applications[i];
          applicationTree.appendChild(buildApp(application));
        }
      }

      function buildApp(application) {
        var applicationElement = APPLICATION_LI_WIDGET.cloneNode(false);
        applicationElement.setAttribute('id', 'concourse_application_' + application.id);
        var applicationLink = APPLICATION_ANCHOR.cloneNode(false);
        applicationElement.appendChild(applicationLink);
        if (application.favorited) {
          applicationLink.className += ' state-overwrite';
        }
        applicationLink.setAttribute('data-target', '#collapseId' + application.id);
        applicationLink.setAttribute('aria-controls', 'collapseId' + application.id);
        applicationLink.setAttribute('aria-expanded', application.open);
        applicationLink.setAttribute('data-id', application.id);
        var titleElement = document.createElement('span');
        applicationLink.appendChild(titleElement);
        setText(titleElement, application.title);
        if ($scope.canEdit()) {
          var editButton = EDIT_APP_BUTTON.cloneNode(false);
          applicationElement.appendChild(editButton);
          editButton.setAttribute('title', i18n.getMessage('Edit Application'));
          editButton.setAttribute('aria-label', i18n.getMessage('Edit Application') + ': ' + application.title);
          editButton.setAttribute('data-id', application.id);
        }
        var favButton = FAV_APP_BUTTON.cloneNode(false);
        applicationElement.appendChild(favButton);
        if (application.favorited) {
          favButton.className += ' icon-star state-overwrite'
        } else {
          favButton.className += ' icon-star-empty';
        }
        favButton.setAttribute('aria-pressed', application.favorited);
        favButton.setAttribute('data-id', application.id);
        favButton.setAttribute('data-favorite-title', application.title);
        favButton.setAttribute('aria-label', (application.favorited ? i18n.getMessage('Remove from Favorites') : i18n.getMessage('Add to Favorites')) + ': ' + application.title);
        favButton.setAttribute('data-dynamic-title', application.favorited ? i18n.getMessage('Remove from Favorites') : i18n.getMessage('Add to Favorites'));
        applicationElement.appendChild(buildModuleList(application));
        return applicationElement;
      }

      function buildModuleList(application) {
        var moduleListContainer = MODULE_LIST_UL.cloneNode(false);
        moduleListContainer.setAttribute('id', 'collapseId' + application.id);
        if (application.open) {
          moduleListContainer.className += ' in';
        }
        for (var j = 0; j < application.modules.length; j++) {
          var module = application.modules[j];
          var moduleElement = LI_WIDGET.cloneNode(false);
          moduleListContainer.appendChild(moduleElement);
          moduleElement.setAttribute('id', 'concourse_module_' + module.id);
          if (module.type === 'SEPARATOR') {
            moduleElement.className += ' sn-widget-list-divider';
          }
          var moduleDiv = MODULE_DIV_WIDGET.cloneNode(false);
          moduleElement.appendChild(moduleDiv);
          var moduleDisplayType = $scope.getModuleDisplayType(module);
          if (moduleDisplayType === 'PARENT') {
            var toggleFoldLink = TOGGLE_FOLD_ANCHOR_WIDGET.cloneNode(false);
            moduleDiv.appendChild(toggleFoldLink);
            toggleFoldLink.setAttribute('data-target', '#collapseId' + module.id);
            toggleFoldLink.setAttribute('aria-controls', '#collapseId' + module.id);
            toggleFoldLink.setAttribute('aria-expanded', module.open);
            toggleFoldLink.setAttribute('data-id', module.id);
            if (module.open) {
              toggleFoldLink.className += ' nav-open-state';
            } else {
              toggleFoldLink.className += ' collapsed';
            }
            var sideSpan = SIDE_SPAN_WIDGET.cloneNode(false);
            toggleFoldLink.appendChild(sideSpan);
            var titleSpan = document.createElement('span');
            setText(titleSpan, module.title);
            toggleFoldLink.appendChild(titleSpan);
            var subModuleList = SUB_MODULE_UL_WIDGET.cloneNode(false);
            moduleDiv.appendChild(subModuleList);
            subModuleList.setAttribute('id', 'collapseId' + module.id);
            if (module.open) {
              subModuleList.className += ' in';
            }
            for (var k = 0; k < module.modules.length; k++) {
              var subModule = module.modules[k];
              var subModuleElement = document.createElement('li');
              subModuleList.appendChild(subModuleElement);
              subModuleElement.setAttribute('id', 'concourse_module_' + subModule.id);
              subModuleElement.appendChild(buildModule(subModule));
            }
          } else if (moduleDisplayType === 'MODULE') {
            var subModuleList = SUB_MODULE_UL_WIDGET.cloneNode(false);
            moduleDiv.appendChild(subModuleList);
            subModuleList.setAttribute('id', 'collapseId' + module.id);
            subModuleList.className += ' in';
            var subModuleElement = document.createElement('li');
            subModuleList.appendChild(subModuleElement);
            subModuleElement.appendChild(buildModule(module));
          }
        }
        return moduleListContainer;
      }

      function buildModule(module) {
        var container = document.createElement('div');
        container.setAttribute('style', 'width: 100%');
        var anchor = document.createElement('a');
        container.appendChild(anchor);
        anchor.className = 'sn-widget-list-item sn-widget-list-item_hidden-action module-node';
        anchor.setAttribute('href', module.uri);
        anchor.setAttribute('target', module.windowName);
        anchor.setAttribute('id', module.id);
        if (module.hint) {
          anchor.setAttribute('title', module.hint);
        }
        var titleOuterDiv = document.createElement('div');
        anchor.appendChild(titleOuterDiv);
        titleOuterDiv.className = 'sn-widget-list-content';
        titleOuterDiv.setAttribute('data-id', module.id);
        var titleInnerDiv = document.createElement('div');
        titleOuterDiv.appendChild(titleInnerDiv);
        titleInnerDiv.className = 'sn-widget-list-title';
        setText(titleInnerDiv, module.title);
        if ($scope.canEdit()) {
          var editDiv = document.createElement('div');
          container.appendChild(editDiv);
          editDiv.className = 'sn-widget-list-content sn-widget-list-content_static sn-widget-list-content_actions sn-widget-list-content_hidden nav-content_hidden state-disable-animation ie9-hook';
          var editButton = EDIT_MODULE_BUTTON.cloneNode(false);
          editDiv.appendChild(editButton);
          editButton.setAttribute('aria-label', i18n.getMessage('Edit Module') + ': ' + module.title);
          editButton.setAttribute('data-id', module.id);
        }
        var favDiv = document.createElement('div');
        container.appendChild(favDiv);
        favDiv.className = 'sn-widget-list-content sn-widget-list-content_static sn-widget-list-content_actions sn-widget-list-content_hidden nav-content_hidden state-disable-animation';
        var favButton = FAV_MODULE_BUTTON.cloneNode(false);
        favDiv.appendChild(favButton);
        if (module.favorited) {
          favButton.className += ' icon-star state-overwrite';
        } else {
          favButton.className += ' icon-star-empty';
        }
        favButton.setAttribute('data-id', module.id);
        favButton.setAttribute('data-favorite-title', module.title);
        favButton.setAttribute('data-dynamic-title', module.favorited ? i18n.getMessage('Remove from Favorites') : i18n.getMessage('Add to Favorites'));
        favButton.setAttribute('aria-label', (module.favorited ? i18n.getMessage('Remove from Favorites') : i18n.getMessage('Add to Favorites')) + ': ' + module.title);
        favButton.setAttribute('aria-pressed', module.favorited);
        return container;
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