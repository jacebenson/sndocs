redirectBasedOnTheDevice();

function redirectBasedOnTheDevice() {
	var userId = g_request.getParameter("sysparm_id");
	var requestId = g_request.getParameter("sysparm_request_id");
	var token = g_request.getParameter("sysparm_token");
	
	var resetPasswordURL = this.getInstanceURL() + '/nav_to.do?uri='+ encodeURIComponent('$pwd_new.do?sysparm_id='+userId+'&sysparm_request_id='+requestId+'&sysparm_nostack=true&sysparm_token=' + token);
	if(GlideMobileExtensions.getDeviceType() == 'm' || GlideMobileExtensions.getDeviceType() == 'mobile') {
		gs.debug("Password Reset request coming in from a mobile device. Changing the URL to be mobile compatible");
		resetPasswordURL = this.getInstanceURL() + '/$pwd_new.do?sysparm_id='+userId+'&sysparm_request_id='+requestId+'&sysparm_nostack=true&sysparm_token=' + token;
	}
	g_response.sendRedirect(resetPasswordURL);
}

function getInstanceURL() {
	var url = gs.getProperty("glide.servlet.uri");
	if (GlideStringUtil.nil(url)) {
		gs.log("glide.servlet.url is empty!");
		return "";
	}
	url = url.trim();
	var len = url.length;
	if (url[len-1] == '/')
		return url.substring(0, len-1);
	
	return url;
}