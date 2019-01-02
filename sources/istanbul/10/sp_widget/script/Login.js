// populate the 'data' object// e.g., data.table = $sp.getValue('table');
//We don't want to set a starting page until we've begun the login process.
data.errorMsg = gs.getMessage("There was an error processing your request");
data.errorMsg2 = gs.getMessage("An error has occurred - please contact your system administrator");
data.passwordMsg = gs.getMessage("Password");
data.usernameMsg = gs.getMessage("User name");

var util = new GlideSPUtil();

if (input && input.action === "set_sso_destination") {
	var gs_nav_to = gs.getSession().getProperty("nav_to");
	gs.getSession().putProperty("nav_to", null);
	
	if (!gs.getSession().getProperty("starting_page"))
		gs.getSession().putProperty("starting_page", gs_nav_to);
		
	return;
}

data.is_logged_in = gs.getSession().isLoggedIn();
data.multisso_enabled = GlideProperties.getBoolean("glide.authenticate.multisso.enabled");
data.default_idp = GlideProperties.get("glide.authenticate.sso.redirect.idp");
data.pageURI = util.getPageUri();