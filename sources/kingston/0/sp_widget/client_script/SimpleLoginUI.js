function(glideUserSession, $sce, $window) {
  var c = this;
	var shared = c.widget.options.shared;

	if (shared.externalLoginURL)
		c.externalLoginURL = $sce.trustAsResourceUrl(shared.externalLoginURL);

	c.username = shared.username ? shared.username : "";

	c.onUsernameChange = function() {
		shared.username = c.username;
	}

	c.onPasswordChange = function() {
		shared.password = c.password;
	}
}