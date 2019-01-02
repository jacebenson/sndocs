(function process(g_request, g_response, g_processor) {

	var response = "";
	if(g_request.getParameter('sysparm_processor') == "AgentScheduleAjax") {
		var processor=new this[g_request.getParameter('sysparm_processor')](g_request);
		response=processor[g_request.getParameter('sysparm_name')]();
	}
	else {
		var json = {error: 'Access denied for this method'};
		var jsonParser = new JSON();
		response = jsonParser.encode(json);
	}
	
	g_response.setContentType("application/json");
	g_processor.writeOutput(response);

})(g_request, g_response, g_processor);