/*! RESOURCE: /scripts/app.$sp/controller.spPage.js */
angular.module("sn.$sp").controller("spPage", function($scope, $http, $location, $window, $timeout, spUtil, nowServer, snRecordWatcher, cabrillo, $rootScope, glideUserSession) {
  var _ = $window._;
  $scope.firstPage = true;
  $scope.page = {};
  $scope.page.title = "Loading...";
  $scope.theme = {};
  $scope.portal = {};
  $scope.sessions = {};
  $scope.status = "";
  $scope.isViewNative = cabrillo.isNative();
  $scope.openWindow = function(parms) {
    var jo = JSON.parse(parms);
    var left = window.screenX + window.innerWidth - 540;
    var top = window.screenY + 140;
    window.open(jo.url, jo.name, "left=" + left + ",top=" + top + "," + jo.specs);
  };
  $scope.parseJSON = function(str) {
    return JSON.parse(str);
  }
  $scope.getContainerClasses = function(container) {
    var classes = {};
    classes[container.width] = !container.bootstrap_alt;
    classes[container.container_class_name] = true;
    return classes;
  }
  var oid = $location.search().id;
  var oldPath = $location.path();
  $rootScope.$on('$locationChangeSuccess', function(e, newUrl, oldUrl) {
    $scope.$broadcast("$$uiNotification.dismiss");
    $scope.locationChanged = (oldUrl != newUrl);
    var s = $location.search();
    var p = $location.path();
    if (oldPath != p) {
      $window.location.href = $location.absUrl();
      return;
    }
    if (angular.isDefined($scope.containers) && oid == s.id && s.spa) {
      e.pageIsHandling = true;
      return;
    }
    if (p.indexOf(".do") > 0 && p.indexOf("sp.do") == -1) {
      var newUrl = $location.absUrl();
      newUrl = newUrl.substr(newUrl.search(/[^\/]+.do/));
      $window.location.href = "/" + newUrl;
      return;
    }
    if (!window.NOW.has_access && $scope.locationChanged) {
      $window.location.href = $location.absUrl();
      return;
    }
    oid = s.id;
    var t = getUrl();
    refreshPage(t);
  });

  function getUrl() {
    var currentParms = $location.search();
    var params = {};
    angular.extend(params, currentParms);
    params.time = new Date().getTime();
    params.portal_id = $scope.portal_id;
    params.request_uri = $location.url();
    return '/api/now/sp/page?' + $.param(params);
  }

  function loadPage(response) {
    $scope.firstPage = false;
    $scope.containers = _.filter(response.containers, {
      'subheader': false
    });
    $scope.subheaders = _.filter(response.containers, {
      'subheader': true
    });
    $scope.rectangles = response.rectangles;
    $scope.style = '';
    var p = response.page;
    var u = response.user;
    if (!isPublicOrUserLoggedIn(p, u)) {
      if ($scope.locationChanged) {
        $window.location.href = $location.absUrl();
        return;
      }
    }
    $rootScope.page = $scope.page = p;
    setCSS(p);
    if (response.portal.title)
      $window.document.title = (p.title) ? response.portal.title + ' - ' + p.title : response.portal.title;
    else
      $window.document.title = p.title;
    $timeout(function() {
      jQuery('section, .flex-item').scrollTop(0);
    });
    $rootScope.theme = $scope.theme = response.theme;
    var style = "";
    if ($scope.isNative)
      style = 'isNative';
    response.portal.logoutUrl = "/logout.do?sysparm_goto_url=/" + response.portal.url_suffix;
    $rootScope.portal = $scope.portal = response.portal;
    if (!$scope.user) {
      $rootScope.user = $scope.user = {};
      glideUserSession.loadCurrentUser().then(function(g_user) {
        $rootScope.g_user = g_user;
      });
    }
    angular.extend($scope.user, response.user);
    $scope.user.logged_in = $scope.user.user_name != 'guest';
    $scope.$broadcast('$$uiNotification', response.$$uiNotification);
    snRecordWatcher.init();
  }
  var pageLoaded = false;
  $scope.$on('sp.page.reload', function() {
    var t = getUrl();
    refreshPage(t);
  });

  function refreshPage(dataURL) {
    if (window.pageData && !pageLoaded) {
      pageLoaded = true;
      loadPage(pageData);
    } else {
      $http.get(dataURL, {
        headers: spUtil.getHeaders()
      }).success(function(response) {
        loadPage(response.result);
      });
    }
  }

  function isPublicOrUserLoggedIn(page, user) {
    if (page.public)
      return true;
    if (user.user_name == "guest")
      return false;
    return true;
  }

  function setCSS(page) {
    jQuery("style[data-page-id='" + page.sys_id + "']").remove();
    if (page.css) {
      var buf = [
        '<style type="text/css" data-page-id="' + page.sys_id + '" data-page-title="' + page.title + '">',
        page.css,
        '</style>'
      ];
      jQuery(jQuery(buf.join('\n'))).appendTo('head');
    }
  }
  $(window).keydown(onKeyDown);

  function onKeyDown(e) {
    if (e.keyCode != 83)
      return;
    if (e.metaKey || e.ctrlKey) {
      e.stopPropagation();
      e.preventDefault();
      $rootScope.$broadcast("$sp.save", e);
    }
  }
  $scope.$on('$destroy', function() {
    $(window).off("keydown", onKeyDown);
  })
});;