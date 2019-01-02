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
	
	var referralUrl = new GlideURL(referrer);
	
	var returnURL = g_request.getParameter('self_return');
	if (returnURL)
		referralUrl.set("sysparm_goto_url", referrer); 
		
	var recordScope = g_request.getParameter('sysparm_record_scope');
	if(recordScope) {
		referralUrl.set('sysparm_record_scope', recordScope);
		referralUrl.set('sysparm_nostack', 'true');
	}
	
	if(appId)
		referralUrl.set("sysparm_record_scope", null);

	referralUrl.set("sysparm_clear_stack", null);
	
	g_response.sendRedirect(referralUrl.toString());
}