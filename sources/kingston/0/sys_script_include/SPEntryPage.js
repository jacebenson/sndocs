/** 
 *
 *  Service Portal sample script include to indicate 
 *  1. which login page should be used
 *  2. the starting page after the user is authenticated 
 * 
 *  Script is configured using system properties
 
 *  PROPERTY                        VALUE
 *  glide.entry.page.script         new SPEntryPage().getLoginURL(); 
 *  glide.entry.first.page.script   new SPEntryPage().getFirstPageURL();
 * 
 * functions can return a path or null if no overrides are necessary
 * 
 **/
var SPEntryPage = Class.create();

SPEntryPage.prototype = {
	
	initialize: function() {
		this.logVariables = false;  // for debugging 
		this.portal = "/sp/";      // The URL suffix specified in the sp_portal record
	},

	/***
	 *
	 * Referred to by property: glide.entry.page.script
	 * 
	 **/
	getLoginURL: function() {
		// When requesting a page directly (eg: /problem_list.do)
		// The platform session_timeout.do sets the login page to welcome.do
		// Since we are handling the login, clear that value
		var session = gs.getSession();
		var nt = session.getProperty("nav_to");
		var sPage = session.getProperty("starting_page");
		if (nt == "welcome.do")
			session.clearProperty("nav_to");
		
		if (!sPage && !nt)
			session.putProperty("starting_page", gs.getProperty("glide.login.home"));
		
		// Send the user to the portal's login page
		var portalGR = new GlideRecord("sp_portal");
		portalGR.addQuery("url_suffix", this.portal.replace(/\//g, ""));
		portalGR.addNotNullQuery("login_page");
		portalGR.query();
		if (portalGR.next())
			return this.portal + "?id=" + portalGR.login_page.id;

		// Send to the a default login page
		return this.portal + "?id=login";
	},
	
	/***
	 *
	 * Referred to by property: glide.entry.first.page.script
	 * 
	 **/
	getFirstPageURL: function() {
		var session = gs.getSession();
		this.logProperties('before', session);

		// has roles and is not a Service Portal page - go to UI16
		var nt = session.getProperty("nav_to");
		var isServicePortalURL = new GlideSPScriptable().isServicePortalURL(nt);
		var redirectURL = session.getProperty("login_redirect");

		if (user.hasRoles() && !redirectURL && !isServicePortalURL)
			return;

		// user may have logged in from a frame, the /login_redirect.do page will bust out of it
		if (!redirectURL) {
			// redirectURL is nav_to 
			// if nav_to == "welcome.do" then use starting_page
			var sPage = session.getProperty("starting_page");
			if (sPage && nt == "welcome.do")
				nt = sPage;
			
			// Avoid a redirect loop to the home page
			var ep = gs.getProperty("glide.login.home");
			if (nt) {
				if (ep == nt)
					nt = null;
			}
			 // PRB726860: if page is still welcome.do, go to glide.login.home preserving frameset
			if (nt == "welcome.do") {
				session.putProperty("nav_to", ep);
				return;
			}
			
			session.putProperty("login_redirect", nt || "true");
			return "/login_redirect.do?sysparm_stack=no";
		}

		session.clearProperty("login_redirect");
		var returnUrl = this.portal;
		if (redirectURL && redirectURL != "true") {
			var spUrl = new GlideSPScriptable().mapUrlToSPUrl(redirectURL);
			returnUrl = spUrl ? this.portal + "?" + spUrl : redirectURL;
		}

		this.logProperties('after', session);
		if (!this.logVariables) {
			gs.log('redirectURL: ' + redirectURL);
			gs.log('User: ' + user.getName());
			gs.log('is internal: ' + (!user.hasRoles()));
			gs.log('returnUrl: ' + returnUrl);
		}

		return returnUrl;
	},

	logProperties: function(beforeOrAfter, session) {
		if (!this.logVariables)
			return; 
		
		gs.log('SPEntryPage: Redirect ------------------------------- ' + beforeOrAfter);
		gs.log('session.starting_page: ' + session.getProperty("starting_page"));
		gs.log('session.nav_to: ' + session.getProperty("nav_to"));
		gs.log('session.login_redirect: ' + session.getProperty("login_redirect"));
		gs.log('gs.fURI: ' + session.getURI());
	},
	
	type: 'SPEntryPage'
};