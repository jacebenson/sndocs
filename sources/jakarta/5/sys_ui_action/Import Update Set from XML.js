function callLoadUpdateSet() {
	var url = new GlideURL('upload.do');
	url.addParam('sysparm_referring_url', "sys_remote_update_set_list.do?sysparm_fixed_query=sys_class_name=sys_remote_update_set");
	url.addParam('sysparm_target', "sys_remote_update_set");
	g_navigation.open(url.getURL());
}