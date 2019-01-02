publishApp(g_request, g_response, g_processor);

function publishApp(g_request, g_response, g_processor) {
	var processor = new sn_appauthor.ScopedAppUploaderAJAX(g_request, g_response, g_processor);
	var response = processor.start();
	g_processor.writeOutput(response);
}