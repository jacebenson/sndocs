(function process(g_request, g_response, g_processor) {

	var url = DiscoveryCMDBUtil.useCMDBIdentifiers() ? 'cmdb_identifier_list.do' : 'ci_identifier_list.do';
	g_response.sendRedirect(new GlideURL(url));

})(g_request, g_response, g_processor);