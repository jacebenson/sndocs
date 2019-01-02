(function process(g_request, g_response, g_processor) {
	var helpResource = g_request.getParameter('help_resource');
	if (helpResource)
		g_response.sendRedirect(new SNC.ContextDocAPI().getURLFromName(helpResource));
})(g_request, g_response, g_processor);