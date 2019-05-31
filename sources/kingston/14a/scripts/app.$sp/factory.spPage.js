/*! RESOURCE: /scripts/app.$sp/factory.spPage.js */
angular.module('sn.$sp').factory('spPage', function($rootScope, spConf, $location, $window, $sanitize) {
  'use strict';

  function getStyle(page) {
    return '<style type="text/css" data-page-id="' + page.sys_id + '" data-page-title="' + $sanitize(page.title) + '">' + page.css + '</style>'
  }

  function getClasses(scope) {
    var style = [];
    if (scope.isNative)
      style.push('isNative');
    if (scope.theme.navbar_fixed)
      style.push('fixed-header');
    if (scope.theme.footer_fixed)
      style.push('fixed-footer');
    return style.join(' ');
  }

  function getElement(page) {
    return "style[data-page-id='" + page.sys_id + "']";
  }

  function isHashChange(newUrl, oldUrl) {
    if (newUrl == oldUrl)
      return false;
    var newUrlParts = newUrl.split("#");
    var oldUrlParts = oldUrl.split("#");
    return (newUrlParts.length > 1 && newUrlParts[0] == oldUrlParts[0]);
  }

  function userLoggedIn(user) {
    if (user.hasOwnProperty("logged_in"))
      return user.logged_in;
    if (user.user_name === "guest")
      return false;
    if (typeof user.user_name !== "undefined" && user.user_name && user.user_name !== "guest")
      return true;
    return user.can_debug_admin;
  }

  function isPublicOrUserLoggedIn(page, user) {
    if (page.public || userLoggedIn(user)) {
      return true;
    }
    return false;
  }

  function getTitle(response) {
    if (response.portal.title) {
      return (response.page.title) ? response.page.title + ' - ' + response.portal.title : response.portal.title;
    }
    return response.page.title;
  }

  function saveOnCtrlS(e) {
    if (e.keyCode != spConf.s)
      return;
    if (e.metaKey || (e.ctrlKey && !e.altKey)) {
      e.stopPropagation();
      e.preventDefault();
      $rootScope.$broadcast("$sp.save", e);
    }
  }

  function getUrl(portalId) {
    var currentParms = $location.search();
    var params = {};
    angular.extend(params, currentParms);
    params.time = new $window.Date().getTime();
    params.portal_id = portalId;
    params.request_uri = $location.url();
    return spConf.pageApi + '?' + $.param(params);
  }

  function containsSystemPage(path) {
    if (path.indexOf('.do') > 0 && path.indexOf(spConf.page) == -1) {
      var newUrl = $location.absUrl();
      return '/' + newUrl.substr(newUrl.search(/[^\/]+.do/));
    }
    return false;
  }

  function showBrowserErrors() {
    $window.console.error = (function(old_function) {
      return function(text) {
        old_function(text);
        $rootScope.$broadcast(spConf.e.notification, {
          type: "error",
          message: "There is a JavaScript error in your browser console"
        });
      };
    }($window.console.error.bind($window.console)));
  }
  return {
    getTitle: getTitle,
    getStyle: getStyle,
    getElement: getElement,
    isHashChange: isHashChange,
    getClasses: getClasses,
    isPublicOrUserLoggedIn: isPublicOrUserLoggedIn,
    userLoggedIn: userLoggedIn,
    saveOnCtrlS: saveOnCtrlS,
    getUrl: getUrl,
    containsSystemPage: containsSystemPage,
    showBrowserErrors: showBrowserErrors
  };
});;