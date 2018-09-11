/*! RESOURCE: /scripts/app.magellan/controller.MagellanCtrl.js */
angular.module('Magellan').controller('MagellanCtrl',
  function(
    $scope,
    $rootScope,
    $element,
    i18n,
    magellan_Endpoint,
    magellan_FavoritesList,
    magellan_HistoryList,
    $timeout,
    snCustomEvent,
    userPreferences,
    VIEW_NAMES,
    keyboardRegistry,
    magellan_Permalink,
    $animate,
    snTabActivity,
    concourseNavigatorService
  ) {
    'use strict';
    snTabActivity.setAppName("magellan");
    $animate.enabled($element, false);
    magellan_Permalink.init();
    var ActiveViewPrefKey = 'navigator.activeView';
    var CollapsedNavPrefKey = 'navigator.collapsed';
    var animatingEditPane = false;
    $scope.views = [{
        viewName: VIEW_NAMES.AllApps,
        icon: "icon-all-apps",
        title: i18n.getMessage("All applications"),
        isEnabled: true
      },
      {
        viewName: VIEW_NAMES.Favorites,
        icon: "icon-star",
        title: i18n.getMessage("Favorites"),
        isEnabled: true
      },
      {
        viewName: VIEW_NAMES.History,
        icon: "icon-history",
        title: i18n.getMessage("Your history"),
        isEnabled: true,
        isActive: false
      }
    ];
    $scope.navigatorLoaded = false;
    $scope.editMode = false;
    $scope.isCollapsed = false;
    $scope.filterText = '';
    $scope.defaultView = loadDefaultView();
    $scope.data = {
      isLoading: true,
      favoritesList: magellan_FavoritesList.favoritesList,
      currentFavorite: magellan_FavoritesList.currentFavorite,
      historyList: magellan_HistoryList.historyList
    };
    $scope.changeActiveView = function(viewName) {
      angular.element("#" + $scope.activeView + "_tab").attr('tabindex', -1);
      $scope.activeView = viewName;
      angular.element("#" + $scope.activeView + "_tab").attr('tabindex', 0).focus();
      $scope.filterTextValue('');
      if ([VIEW_NAMES.AllApps, VIEW_NAMES.Favorites].indexOf(viewName) != -1)
        userPreferences.setPreference('navigator.activeView', viewName);
    };
    $scope.keyChangeActiveView = function(e) {
      if (!(e.keyCode == 39 || e.keyCode == 37))
        return;
      e.preventDefault();
      for (var i = 0; i < $scope.views.length; i++) {
        if ($scope.views[i].viewName == $scope.activeView) {
          if (e.keyCode == 39)
            $scope.changeActiveView($scope.views[(i + 1) % $scope.views.length].viewName);
          else if (e.keyCode == 37)
            $scope.changeActiveView($scope.views[(i - 1 + $scope.views.length) % $scope.views.length].viewName);
          return;
        }
      }
    }
    $scope.navigate = function(url, target) {
      if (url) {
        if (target && target != 'gsft_main') {
          window.open(url, target);
        } else {
          jQuery('#gsft_main').attr('src', url);
          snCustomEvent.fire("glide:nav_open_url", {
            url: url,
            openInForm: false
          });
        }
      }
    };
    $scope.clearFilterText = function() {
      $scope.filterTextValue('');
      $scope.focusFilter();
    };
    $scope.toggleCollapse = function(toggleBodyClass, collapsed) {
      if (!$scope.editMode) {
        if (typeof collapsed !== 'undefined') {
          $scope.isCollapsed = collapsed;
        } else {
          $scope.isCollapsed = !$scope.isCollapsed;
        }
        if ($scope.isCollapsed == true)
          userPreferences.setPreference('navigator.collapsed', "yes");
        else
          userPreferences.setPreference('navigator.collapsed', "no");
        if (toggleBodyClass)
          jQuery('#nav_west_north, #nav_west_center').hide();
        jQuery('.navpage-layout').toggleClass('navpage-nav-collapsed');
        $timeout(function() {
          jQuery('#nav_west_north, #nav_west_center').fadeIn(400);
        }, 200);
        if ($scope.isCollapsed) {
          $scope.preservedView = $scope.activeView;
          $scope.changeActiveView(VIEW_NAMES.Favorites);
          jQuery(document).trigger('nav.collapsed');
        } else {
          $scope.activeView = "allApps";
          jQuery(document).trigger('nav.expanding');
          $timeout(function() {
            if (angular.isDefined($scope.preservedView)) {
              $scope.changeActiveView($scope.preservedView);
            }
            jQuery(document).trigger('nav.expanded');
          }, 350);
        }
      }
    };
    $scope.openNavigator = function(toggleBodyClass) {
      if ($scope.isCollapsed && !$scope.editMode) {
        $scope.toggleCollapse(toggleBodyClass, false);
      }
    };
    snCustomEvent.on('magellan_collapse.toggle', function() {
      $scope.toggleCollapse(true);
    });
    concourseNavigatorService.onChangeVisibility(function() {
      $timeout(function() {
        filterFavorites();
      });
    });
    loadData();

    function loadData() {
      magellan_Endpoint.Navigator.getApplicationsAndFavorites().then(function(result) {
        concourseNavigatorService.applications = result.applications;
        if (result.favorites) {
          magellan_FavoritesList.populate(result.favorites);
          $scope.data.favoritesList = magellan_FavoritesList.favoritesList;
          $scope.data.currentFavorite = magellan_FavoritesList.currentFavorite;
        }
        if (result.history) {
          magellan_HistoryList.populate(result.history);
          $scope.data.historyList = magellan_HistoryList.historyList;
        }
        $scope.data.isLoading = false;
        filterFavorites();
        toggleNavPaneVisibility(result.applications);
      });
    }
    snCustomEvent.on('navigator.refresh', function() {
      loadData();
    });

    function filterFavorites() {
      magellan_FavoritesList.filter($scope.filterText);
      render();
    }

    function render() {
      $scope.data.favoritesList = magellan_FavoritesList.favoritesList;
      if ($scope.filterText !== '') {
        $scope.activeView = VIEW_NAMES.Filtered;
        jQuery('#gsft_nav .nav-favorites-list .collapse').addClass("in").css("height", "auto");
      } else {
        if ($scope.activeView == VIEW_NAMES.Filtered) {
          $scope.activeView = $scope.defaultView;
        }
      }
    }

    function loadDefaultView() {
      userPreferences.getPreference(ActiveViewPrefKey).then(function(resp) {
        if (resp && resp != '' && resp != 'null')
          $scope.defaultView = resp;
      });
      userPreferences.getPreference(CollapsedNavPrefKey).then(function(resp) {
        if (resp && resp != '' && resp != 'null') {
          if (resp == "yes")
            $scope.toggleCollapse(true);
        }
      });
      return VIEW_NAMES.AllApps;
    }
    $scope.focusFilter = function() {
      if ($scope.isCollapsed) {
        $scope.toggleCollapse(true);
        $timeout(function() {
          angular.element('#filter').focus();
        }, 200);
      } else {
        $timeout(function() {
          angular.element('#filter').focus();
        });
      }
    };
    $scope.toggleEditMode = function() {
      if (animatingEditPane) {
        return;
      }
      animatingEditPane = true;
      setTimeout(function() {
        animatingEditPane = false;
      }, 410);
      if ($scope.editMode) {
        magellan_FavoritesList.update($scope.data.favoritesList);
        $scope.changeActiveView($scope.currentActiveView);
      } else {
        $scope.currentActiveView = $scope.activeView;
        $scope.changeActiveView('favorites');
      }
      $scope.editMode = !$scope.editMode;
      $rootScope.$broadcast('magellan_EditMode.change', $scope.editMode);
      snCustomEvent.fireAll('magellan_EditMode.change', $scope.editMode);
    };
    $rootScope.$on('magellan_closeEditFavorites', function() {
      $scope.editMode = false;
      $rootScope.$broadcast('magellan_EditMode.change', $scope.editMode);
      snCustomEvent.fireAll('magellan_EditMode.change', $scope.editMode);
    });
    $rootScope.$on('magellan_FavoritesList.change', function() {
      if (!$scope.$$phase) {
        $scope.$apply(render());
      }
    });
    $rootScope.$on('magellan_HistoryList.change', function() {
      if (!$scope.$$phase) {
        $scope.$apply(render());
      }
    });

    function _applyUtil($scope, f) {
      if (!$scope.$$phase) {
        $scope.$apply(f);
      } else {
        f();
      }
    }
    $rootScope.$on('applicationTree.rendered', function() {
      if (!$scope.navigatorLoaded) {
        _applyUtil($scope, function() {
          $scope.navigatorLoaded = true;
          $scope.activeView = $scope.defaultView;
          snCustomEvent.fire('nav.loaded');
        });
      }
    });
    $scope.$on('nav.toggleCollapse', function() {
      if (jQuery('.navpage-layout').hasClass('navpage-nav-collapsed')) {
        $scope.$apply(function() {
          $scope.toggleCollapse(false);
        })
      }
    });

    function toggleNavPaneVisibility(applications) {
      if (applications.length === 0)
        $scope.$emit('nav.emptyNav');
      else
        $scope.$emit('nav.notEmptyNav');
    }
    $scope.$on('nav.emptyNav', function() {
      angular.element('.navpage-layout').addClass('navpage-nav-hidden');
    });
    $scope.$on('nav.notEmptyNav', function() {
      angular.element('.navpage-layout').removeClass('navpage-nav-hidden');
    })
  });;