var payload = g_request.getParameter("sysparm_data");
var json = {};
try{
	var result = new TourBuilderMain().process(payload);
    json = {"result":result};
}catch(error){
    gs.error("Payload {0} ", new global.JSON().encode(payload));
    gs.error("Error thrown {0} ", new global.JSON().encode(error));
	json={"error":error};
}
var resp = new global.JSON().encode(json);
g_response.setContentType("application/json");
g_processor.writeOutput(resp);