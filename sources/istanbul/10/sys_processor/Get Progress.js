getProgress(g_request, g_processor);

function getProgress(g_request, g_processor) {
	var execution_id = g_request.getParameter('sysparm_execution_id');
	gs.info("AJAXProgressStatusChecker:getStatus: execution_id = " + execution_id);
	
	var pgr = new GlideRecord('sys_execution_tracker');
	pgr.get(execution_id);
	var status = getStatusLayer(pgr);
	CacheBuster.addNoCacheHeaders(g_response);
	g_processor.writeOutput("application/json", new global.JSON().encode(status));
}

function getStatusLayer(gr) {
	var obj = {};
	obj.name = gr.name.toString();
	obj.state = gr.state.toString();
	obj.message = gr.message.toString();
	obj.result = new global.JSON().decode(gr.result.toString());
	obj.sys_id = gr.sys_id.toString();
	obj.percent_complete = gr.percent_complete.toString();
	obj.updated_on = gr.sys_updated_on.toString();
	
	/*
	var startTime = new global.GlideDateTime(gr.start_time);
	var endTime = new global.GlideDateTime(gr.completion_time);
	var duration = new global.GlideDuration(endTime.getNumericValue() - startTime.getNumericValue());
	
	obj.duration = duration.getDisplayValue();
	*/
	
	obj.children = [];
	obj.results = [];
	var pgr = new GlideRecord("sys_execution_tracker");
	pgr.addQuery("parent", gr.sys_id);
	pgr.orderBy("order");
	pgr.query();
	while (pgr.next()) {
		obj.children.push(getStatusLayer(pgr));
	}
	return obj;
}



/*getProgress(g_request, g_response, g_processor);

function getProgress(g_request, g_response, g_processor) {
	var processor = new global.AJAXProgressStatusChecker(g_request, g_response, g_processor);
	var response = processor.getStatus();
	g_processor.writeOutput(response);
}*/