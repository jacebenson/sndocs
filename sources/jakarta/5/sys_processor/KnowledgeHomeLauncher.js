var params = g_request.getParameterNames();
var page = '$knowledge.do';
var pageParam = '';
var browser = gs.getSession().getProperty('user_agent_browser')+'';
var browser_version = gs.getSession().getProperty('user_agent_version_nocompat')+'';
// Browsers IE 9 or older should be redirected to the legacy knowledge home 
if(browser == 'ie' && browser_version.length != 2) {
	page = 'kb_home.do';
	pageParam = "sysparm_ui_fallback=true";
}
while (params.hasMoreElements()) {
	var param = params.nextElement();
	var paramVal = g_request.getParameter(param);
	if(paramVal) {
		if(pageParam === '')
			pageParam = param + '=' + paramVal;
		else
			pageParam = pageParam + '&' + param + '=' + paramVal;
	}
}
var url = page + '?' + encodeURI(pageParam);
g_response.sendRedirect(url);