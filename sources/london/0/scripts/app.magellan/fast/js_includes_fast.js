/*! RESOURCE: /scripts/app.magellan/fast/js_includes_fast.js */
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
        if (application.open) {
          applicationLink.setAttribute('aria-controls', 'collapseId' + application.id);
        }
        applicationLink.setAttribute('aria-expanded', application.open);
        applicationLink.setAttribute('data-id', application.id);
        if (application.hint) {
          applicationLink.setAttribute('title', application.hint);
        }
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
            if (module.hint) {
              toggleFoldLink.setAttribute('title', module.hint);
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

      function accessibilityEnabled() {
        return Boolean(window.g_accessibility);
      }

      function buildModule(module) {
        var container = document.createElement('div');
        container.setAttribute('style', 'width: 100%');
        var anchor = document.createElement('a');
        container.appendChild(anchor);
        var classes = ['sn-widget-list-item', 'sn-widget-list-item_hidden-action', 'module-node'];
        if (accessibilityEnabled()) {
          classes.push('accessible-nav-focus');
          classes.push('default-focus-outline');
        }
        anchor.className = classes.join(' ');
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
/*! RESOURCE: /scripts/app.magellan/fast/directive.ngModelUpdateOnEnter.js */
angular.module('Magellan').directive('ngModelUpdateOnEnter', function() {
  return {
    restrict: 'A',
    require: 'ngModel',
    scope: {
      'onEnter': '<?ngModelUpdateOnEnter'
    },
    link: function(scope, element, attrs, ctrl) {
      element.on('keyup', function(ev) {
        if (ev.keyCode === 13) {
          _applyUtil(scope, function() {
            ctrl.$commitViewValue();
            if (scope.onEnter) {
              scope.onEnter(ev);
            }
          });
        }
      });

      function _applyUtil($scope, f) {
        if (!$scope.$$phase) {
          $scope.$apply(f);
        } else {
          f();
        }
      }
    }
  };
});;
/*! RESOURCE: /scripts/app.magellan/fast/concourseNavigatorService.js */
angular.module('Magellan').factory('concourseNavigatorService', function(
  $q,
  $window,
  glideUrlBuilder,
  userPreferences
) {
  'use strict';
  var DEBUG_LOG = 'concourseNavigatorService';
  var DEBUG_METRICS = false;
  var ALLOW_SINGLE_CHAR = "" === "true";
  var STATE_INITIALIZING = 'INIT';
  var STATE_ALL = 'ALL';
  var STATE_FILTERING = 'FILTERING';
  var STATE_REMOVING_FILTERING = 'REMOVING';
  var STATE_ADDING_FILTERING = 'ADDING';
  var _state = STATE_INITIALIZING;
  var TYPE_APP = 'APP';
  var TYPE_MODULE = 'MODULE';
  var TYPE_SEPARATOR = 'SEPARATOR';
  var TYPE_PARENT = 'PARENT';
  var APP_PREFIX = 'concourse_application_';
  var MODULE_PREFIX = 'concourse_module_';
  var EVENT_CHANGE_APPS = 'apps';
  var EVENT_CHANGE_VISIBILITY = 'visibility';
  var _eventSubscribers = {};
  var _navigatorApps = [];
  var _parentsById = {};
  var _filterTerm = '';
  var _filteredVisibility = {};
  var FILTERED_VISIBILITY_MOD_LIMIT = 2;
  var IS_ADMIN = $window.NOW.user.roles && $window.NOW.user.roles.split(',').indexOf('admin') !== -1;

  function canEdit() {
    return IS_ADMIN;
  }

  function setApplications(apps) {
    _navigatorApps.length = 0;
    _parentsById = {};
    DEBUG_METRICS && console.time(DEBUG_LOG + ':Create applications');
    _createApplications(apps);
    DEBUG_METRICS && console.timeEnd(DEBUG_LOG + ':Create applications');
    _fireEvent(EVENT_CHANGE_APPS, _navigatorApps);
    if (_state === STATE_FILTERING) {
      _filteredVisibility = {};
      var visibilityDelta = _filterApplications(_filterTerm);
      _fireEvent(EVENT_CHANGE_VISIBILITY, visibilityDelta);
    } else {
      _state = STATE_ALL;
    }
  }

  function setOpenState(type, sysId, isOpen) {
    if (_state !== STATE_ALL) {
      return;
    }
    var key = _getKey(type, sysId);
    _parentsById[key].open = isOpen;
    switch (type) {
      case TYPE_APP:
        userPreferences.setPreference('menu.' + sysId + '.expanded', isOpen ? 'true' : '');
        break;
      case TYPE_PARENT:
        userPreferences.setPreference('collapse.section.' + sysId, isOpen ? '' : 'true');
        break;
    }
  }

  function setFilterTerm(value) {
    if (!angular.isString(value)) {
      value = '';
    }
    if (!ALLOW_SINGLE_CHAR && value.length === 1) {
      return;
    }
    if (_filterTerm === value) {
      return;
    }
    var _isFiltering = value.length > 0;
    if (_isFiltering) {
      if (_state === STATE_ALL) {
        _filteredVisibility = {};
        _state = STATE_ADDING_FILTERING;
      }
    } else {
      if (_state === STATE_FILTERING) {
        _state = STATE_REMOVING_FILTERING;
      }
    }
    DEBUG_METRICS && console.time(DEBUG_LOG + ':Get visibility delta');
    var _visibilityDelta = _isFiltering ? _filterApplications(value) : _unfilterApplications();
    DEBUG_METRICS && console.timeEnd(DEBUG_LOG + ':Get visibility delta');
    _fireEvent(EVENT_CHANGE_VISIBILITY, _visibilityDelta);
    _filterTerm = value;
    if (_isFiltering) {
      _state = STATE_FILTERING;
    } else {
      _state = STATE_ALL;
    }
  }

  function getVisibleModuleCountByType(app) {
    var visibleChildren = 0;
    var visibleSeparators = 0;
    if (app.open && app.modules) {
      app.modules.forEach(function(module) {
        switch (module.type) {
          case TYPE_SEPARATOR:
            visibleSeparators++;
            break;
          default:
            visibleChildren++;
            break;
        }
        if (module.open && module.modules) {
          visibleChildren += module.modules.length;
        }
      });
    }
    return {
      modules: visibleChildren,
      separators: visibleSeparators
    };
  }

  function _getKey(type, sysId) {
    return angular.isDefined(sysId) ? type + '_' + sysId : type.type + '_' + type.id;
  }

  function _createApplications(apps) {
    var newApps = [];
    apps.forEach(function(app) {
      var newApp = _createApplication(app);
      newApps.push(newApp);
      var key = _getKey(newApp);
      _parentsById[key] = newApp;
    });
    _navigatorApps.push.apply(_navigatorApps, newApps);
  }

  function _createApplication(application) {
    var open = application.open;
    if (angular.isUndefined(open)) {
      open = false;
    }
    return {
      id: application.id,
      type: TYPE_APP,
      title: application.title,
      hint: application.hint,
      color: application.color,
      favorited: application.favorited,
      open: open,
      modules: _createModules(application.modules)
    };
  }

  function _createModules(modules) {
    var appModules = [];
    if (!modules || modules.length == 0) {
      return appModules;
    }
    modules.forEach(function(module) {
      var appModule = _createModule(module);
      appModules.push(appModule);
      switch (appModule.type) {
        case TYPE_SEPARATOR:
          if (angular.isUndefined(module.title) || module.title === '') {
            appModules.push.apply(appModules, appModule.modules);
            appModule.modules = [];
          } else {
            appModule.type = TYPE_PARENT;
            var key = _getKey(appModule);
            _parentsById[key] = appModule;
          }
          break;
      }
    });
    return appModules;
  }

  function _createModule(module) {
    var appModule = {
      name: module.name,
      filter: module.filter,
      type: module.type,
      id: module.id,
      title: module.title,
      hint: module.hint,
      viewName: module.viewName,
      uri: _buildModuleURI(module),
      open: module.open,
      windowName: module.windowName || 'gsft_main',
      favorited: module.favorited,
      modules: _createModules(module.modules)
    };
    return appModule;
  }

  function _buildModuleURI(module) {
    if (typeof module === 'undefined') {
      return;
    }
    if (module.type === 'FILTER') {
      module.uri = module.name + "_list.do?sysparm_view=" + module.viewName + "&sysparm_filter_only=true&sysparm_query=" + module.filter;
    }
    var uri = module.cancelable === 'true' ? glideUrlBuilder.getCancelableLink(module.uri) : module.uri;
    if (module.type !== 'LIST') {
      return uri;
    }
    return _appendClearStack(uri);
  }

  function _appendClearStack(link) {
    var nextChar = link.indexOf('?') > -1 ? '&' : '?';
    link += nextChar + "sysparm_clear_stack=true";
    return link;
  }

  function _unfilterApplications() {
    var visibilityDelta = [];
    _navigatorApps.forEach(function(app) {
      _restoreVisibility(app, visibilityDelta);
      _eachChild(app, function(module) {
        _restoreVisibility(module, visibilityDelta);
      });
    });
    return {
      items: visibilityDelta,
      apps: []
    };
  }

  function _filterApplications(filterText) {
    filterText = filterText.toLowerCase();
    var filteredItems = [];
    var visibleApps = [];
    _navigatorApps.forEach(function(app) {
      var showApp = _computeFilteredVisibility(filterText, app, filteredItems);
      if (showApp) {
        visibleApps.push(app);
      }
      _setFilteredVisibility(app, showApp, filteredItems);
    });
    return {
      items: filteredItems,
      apps: visibleApps
    };
  }

  function _computeFilteredVisibility(filterText, parent, filteredItems) {
    var showParent = angular.isDefined(parent.title) && parent.title.toLowerCase().indexOf(filterText) >= 0;
    if (showParent) {
      _eachChild(parent, function(child) {
        _setFilteredVisibility(child, true, filteredItems);
      });
    } else {
      _eachChild(parent, function(child) {
        var showChild = _computeFilteredVisibility(filterText, child, filteredItems);
        _setFilteredVisibility(child, showChild, filteredItems);
        if (showChild) {
          showParent = true;
        }
      }, true);
    }
    return showParent;
  }

  function _eachChild(app, iterator, directChildrenOnly) {
    var modules = app.modules;
    if (!modules || modules.length === 0) {
      return;
    }
    modules.forEach(function(module) {
      iterator(module, app);
      if (!directChildrenOnly) {
        _eachChild(module, iterator);
      }
    });
  }

  function _restoreVisibility(item, delta) {
    delta.push({
      type: item.type,
      id: (item.type === TYPE_APP ? APP_PREFIX : MODULE_PREFIX) + item.id,
      visible: true,
      open: item.open
    });
  }

  function _setFilteredVisibility(item, visible, delta) {
    var key = item.id;
    switch (_state) {
      case STATE_REMOVING_FILTERING:
      case STATE_INITIALIZING:
      case STATE_ALL:
        throw 'Should not be called in this state';
      case STATE_ADDING_FILTERING:
      case STATE_FILTERING:
        var cachedItem = _filteredVisibility[key];
        var isVisible = cachedItem && cachedItem.state === visible;
        var isHandled = cachedItem && cachedItem.modifiedCount >= FILTERED_VISIBILITY_MOD_LIMIT;
        if (isVisible && isHandled) {
          return;
        }
        break;
    }
    delta.push({
      type: item.type,
      id: (item.type === TYPE_APP ? APP_PREFIX : MODULE_PREFIX) + item.id,
      visible: visible,
      open: visible
    });
  }

  function setVisibilityForKey(key, visible) {
    var item;
    if (!key) {
      return;
    }
    if (angular.isUndefined(_filteredVisibility[key])) {
      _filteredVisibility[key] = {
        modifiedCount: 0
      };
    }
    item = _filteredVisibility[key];
    if (item.state === visible) {
      item.modifiedCount++;
    } else {
      item.state = visible
      item.modifiedCount = 0;
    }
    return item;
  }

  function _addEventSubscriber(type, subscriber) {
    if (!_eventSubscribers[type]) {
      _eventSubscribers[type] = [];
    }
    _eventSubscribers[type].push(subscriber);
  }

  function _fireEvent(type, data) {
    var subscribers = _eventSubscribers[type];
    if (subscribers && subscribers.length) {
      subscribers.forEach(function(subscriber) {
        subscriber(data);
      });
    }
  }
  return {
    get DEBUG_METRICS() {
      return DEBUG_METRICS;
    },
    set filterTerm(value) {
      setFilterTerm(value);
    },
    set applications(apps) {
      setApplications(apps);
    },
    get applications() {
      return _navigatorApps;
    },
    setVisibilityForKey: setVisibilityForKey,
    getVisibleModuleCountByType: getVisibleModuleCountByType,
    canEdit: canEdit,
    setOpenState: setOpenState,
    onChangeApps: function(subscriber) {
      _addEventSubscriber(EVENT_CHANGE_APPS, subscriber);
      if (_navigatorApps.length) {
        subscriber(_navigatorApps);
      }
    },
    onChangeVisibility: function(subscriber) {
      _addEventSubscriber(EVENT_CHANGE_VISIBILITY, subscriber);
    }
  };
});;;