(function process(g_request, g_response, g_processor) {
	
	var sysid = g_request.getParameter("sysparm_sys_id");	
	var suggestion = new GlideRecord("sys_index_suggestion");
	suggestion.get(sysid);
	
	suggestion.setValue("imported", true);
	suggestion.setValue("imported_example", suggestion.slow_query.example);

	var exporter = new ExportNonDBBackedRecord("sys_index_suggestion", suggestion);
	exporter.exportRecord(g_response);
	
})(g_request, g_response, g_processor);