var table = g_request.getParameter('sysparm_table');
var sys_id =  g_request.getParameter('sysparm_sys_id');
var isFormatter = g_request.getParameter('sysparm_is_formatter');
var isNoScroll = g_request.getParameter('sysparm_no_scroll');
var a = new GlideappLiveFeedUIAction();
var x = a.getGroupID(table, sys_id);
if (!isFormatter)
	isFormatter = '';

var isStack = g_request.getParameter('sysparm_stack');
var page = 'live_feed_small.do';
var live_feed_version = new LiveFeedUtil().getLiveFeedVersion();

if(live_feed_version == '2.0')
	page = '$live_feed.do';
var url = page + '?sysparm_feed_type=group_feed&sysparm_group_id=' + x + '&sysparm_is_formatter=' + isFormatter;
if(live_feed_version == '2.0')
	url = url+'&sysparm_viewsize=small';
if (isStack)
	url = url+'&sysparm_stack=' + isStack;
if (isNoScroll)
	url = url + '&sysparm_no_scroll=' + isNoScroll;
g_response.sendRedirect(url);
