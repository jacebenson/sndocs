(function process(g_request, g_response, g_processor) {
	var valves =  new GlideappValveProcessor();
    if (valves.beforeProcessor(g_request, g_response, g_processor))
       return;
	var a = new ServiceCatalogProcessor(g_request, g_response, g_processor);
    a.process();
})(g_request, g_response, g_processor);