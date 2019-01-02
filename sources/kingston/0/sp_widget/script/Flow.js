(function() {
	
	data.flowSysID = $sp.getParameter('sys_id');
	data.sessionSysID = $sp.getParameter('session_id');
	
	var flowSession = new FlowSession(data.flowSysID);
	
	data.screen = flowSession.getCurrentScreen();
	data.responses = flowSession.getResponses();
	
	data.loadingWidget = $sp.getWidget(flowSession.getFlow().getLoadingWidget());
	
	if (data.screen.type === 'widget') {
		
		var widgOptions = {
			options: data.screen.options,
			responses: data.responses
		};
		
		data.screen.widget = $sp.getWidget(
			data.screen.widget,
			widgOptions
			);
	}
	
	if (data.screen.type === 'form') {
		data.screen.form = $sp.getForm(data.screen.table, '-1');
	}

})();