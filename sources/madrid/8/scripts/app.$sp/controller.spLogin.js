/*! RESOURCE: /scripts/app.$sp/controller.spLogin.js */
angular.module("sn.$sp").controller("spLogin", function($scope, $http, $window, $attrs, spUtil, spConf, $location, i18n) {
  $scope.mfa = $attrs.mfa == "true";
  $scope.login = function(username, password) {
    var url = spUtil.getURL({
      sysparm_type: 'view_form.login'
    });
    var pageId = $location.search().id || $scope.page.id;
    var isLoginPage = $scope.portal.login_page_dv == pageId;
    return $http({
      method: 'post',
      url: url,
      data: $.param({
        sysparm_type: 'login',
        'ni.nolog.user_password': true,
        remember_me: typeof $scope.remember_me != 'undefined' && !!$scope.remember_me ? true : false,
        user_name: username,
        user_password: password,
        get_redirect_url: true,
        sysparm_goto_url: isLoginPage ? null : $location.url(),
        mfa_redirect_url: $location.url()
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).then(function(response) {
      if (!response.data) {
        $scope.message = i18n.getMessage("There was an error processing your request");
        return;
      }
      if (response.data.status == 'mfa_code_required')
        $window.location = '/validate_multifactor_auth_code.do';
      else if (response.data.status == 'success') {
        if ($scope.mfa) {
          spUtil.get({
            widget: {
              sys_id: "6506d341cb33020000f8d856634c9cdc"
            }
          }, {
            action: "multi_factor_auth_setup",
            directTo: response.data.redirect_url
          }).then(function() {
            $window.location = response.data.redirect_url;
          });
        } else {
          $scope.success = response.data.message;
          $window.location = response.data.redirect_url;
        }
      } else {
        $scope.message = response.data.message;
      }
    }, function errorCallback(response) {
      $scope.message = i18n.getMessage("There was an error processing your request");
    });
  }
});;