(function process(g_request, g_response, g_processor) {

	if(pm.isActive("com.snc.field_normalization"))
		g_response.sendRedirect("canon_plugin_warning.do");
	else
		g_response.sendRedirect('v_plugin.do?sys_id=services_canonicalization.client');

})(g_request, g_response, g_processor);