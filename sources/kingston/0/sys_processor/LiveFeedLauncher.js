var viewSize = g_request.getParameter('sysparm_viewsize');
var params = ['sysparm_nostack',
			  'sysparm_viewsize',
			  'sysparm_device',
			  'sysparm_feed_type',
			  'sysparm_group_id',
			  'sysparm_msg_id',
			  'sysparm_view_type',
			  'sysparm_sys_id'];
var page = 'live_feed.do';
if(viewSize == 'small')
	page = 'live_feed_small.do';
var live_feed_version = new LiveFeedUtil().getLiveFeedVersion();
if(live_feed_version == '2.0') {
	page = '$live_feed.do';
}
var pageParam = '';
for(var i=0;i<params.length;i++) {
	var param = params[i];
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