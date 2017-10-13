/*! RESOURCE: /scripts/app.$sp/controller.spLogin.js */
angular.module("sn.$sp").controller("spLogin", function($scope, $http, $window, urlTools, $location, i18n) {
  $scope.login = function(username, password) {
    var url = urlTools.getURL('view_form.login');
    var pageId = $location.search().id || $scope.page.id;
    var isLoginPage = $scope.portal.login_page_dv == pageId;
    return $http({
      method: 'post',
      url: url,
      data: urlTools.encodeURIParameters({
        'sysparm_type': 'login',
        'ni.nolog.user_password': true,
        'remember_me': typeof remember_me != 'undefined' && !!remember_me ? true : false,
        'user_name': username,
        'user_password': password,
        'get_redirect_url': true,
        'sysparm_goto_url': isLoginPage ? null : $location.url()
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).then(function(response) {
      if (!response.data) {
        $scope.message = i18n.getMessage("There was an error processing your request");
        return;
      }
      if (response.data.status == 'success') {
        $scope.success = response.data.message;
        $window.location = response.data.redirect_url;
      } else {
        $scope.message = response.data.message;
      }
    }, function errorCallback(response) {
      $scope.message = i18n.getMessage("There was an error processing your request");
    });
  }
});