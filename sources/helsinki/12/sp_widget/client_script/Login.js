function loginCtrl($scope, $http, $window, $location, urlTools, glideUserSession, glideSystemProperties, spUtil) {

	var c = this;
	
	if (typeof c.options.show_panel == 'undefined') {
		c.options.show_panel = true;
	}
			
	//
	if (!c.data.is_logged_in && c.data.multisso_enabled &&c.data.default_idp) {
		c.server.get({
			action: "set_sso_destination", 
			pageURI: c.data.pageURI
		}).then(function() {
			$window.location = "/login_with_sso.do?glide_sso_id=" + c.data.default_idp;
		});
	}
	
	c.login = function(username, password) {
		var url = urlTools.getURL('view_form.login');
		// If the page isn't public then the id in the 
		// url won't match the rendered page id.
		var pageId = $location.search().id || $scope.page.id;
		var isLoginPage = $scope.portal.login_page_dv == pageId;
		
		return $http({
			method: 'post',
			url: url,
			data: urlTools.encodeURIParameters({
				'sysparm_type': 'login',
				'ni.nolog.user_password': true,
				'remember_me': !!c.remember_me ? true : false,
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
				c.message = $scope.data.errorMsg;
				return;
			}
			
			if (response.data.status == 'success') {
				c.success = response.data.message;
				$window.location = response.data.redirect_url;
			} else {
				// wrong username or password
				c.message = response.data.message;
				c.password = "";
			}
			
		}, function errorCallback(response) {
			// error
			c.message = $scope.data.errorMsg;
		});
	};
	
	c.externalLogin = function() {
		c.server.get({
			action: "set_sso_destination", 
			pageURI: c.data.pageURI
		}).then(function() {
			glideSystemProperties.set("glide.authenticate.multisso.enabled", true);

			glideUserSession.getSsoRedirectUrlForUsername(c.username)
				.then(function(url) {
					$window.location = url;
				}, function(err) {
					spUtil.addErrorMessage($scope.data.errorMsg2);
				});
		});
	}
	
	c.setExternalLogin = function(newVal) {
		c.externalLoginMode = newVal;
	}
}