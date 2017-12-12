switchCurrentApp();

function switchCurrentApp() {
	var appId = g_request.getParameter('app_id');
	if(appId)
		gs.setCurrentApplicationId(appId);
	
	var refreshNav = g_request.getParameter('refresh_nav');
	if(refreshNav == 'true')
		SncAppsUtil.flushNavigator();
	
	var referrer = g_request.getParameter('referrer');
	if (!referrer)
		referrer = g_request.getHeader('referer');

	//now make sure it's a relative URL, or it's an in-instance URL
	referrer = getSafeURL(referrer);
	var referralUrl = new GlideURL(referrer);
	var returnURL = g_request.getParameter('self_return');
	if (returnURL)
		referralUrl.set('sysparm_goto_url', referrer);

	var recordScope = g_request.getParameter('sysparm_record_scope');
	if(recordScope) {
		referralUrl.set('sysparm_record_scope', recordScope);
		referralUrl.set('sysparm_nostack', 'true');
	}

	if(appId)
		referralUrl.set('sysparm_record_scope', null);

	referralUrl.set('sysparm_clear_stack', null);

	g_response.sendRedirect(referralUrl.toString());
}

function getSafeURL(url) {
	if (!url)
		return url;
	
	if (isWhitelistedDomain(url))
		return url;

	if (url.startsWith('http:') || url.startsWith('https:'))
		if (!url.startsWith(gs.getProperty('glide.servlet.uri')))
			url = gs.getProperty('glide.servlet.uri');

	return url;
}

function isWhitelistedDomain(url) {
   var domains = gs.getProperty('glide.change_current_app.whitelist', '');
   var domainArray = domains.split(',');
	
   //strip protocol
   if (url.startsWith('http://'))
       url = url.substr(7);
   else if (url.startsWith('https://'))
       url = url.substr(8);

   for (var i=0; i<domainArray.length; i++) {
       var whitelistedDomain = domainArray[i].trim();
           //handles the case where you're redirecting to just localhost:8080 or vanity.domain
           //in addition to a url like localhost:8080/some_page.do or vanity.domain/home.do
       if (url.startsWith(whitelistedDomain + '/') || url == whitelistedDomain)
           return true;
   }

   return false;
}