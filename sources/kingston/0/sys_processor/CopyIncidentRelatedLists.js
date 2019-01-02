(function process(g_request, g_response, g_processor) {
	var actionVerb = j2js(g_request.getParameter('sysparm_returned_action'));
	var srcSysID = j2js(g_request.getParameter("srcSysID"));
	var newSysID = j2js(g_request.getParameter("newSysID"));

	if (JSUtil.nil(actionVerb) || JSUtil.nil(srcSysID) || JSUtil.nil(newSysID))
		gs.error('com.snc.incident - processor - CopyIncidentRelatedLists - Required parameters missing');
	else {
		var incidentUtils = new IncidentUtils();
		var urlOnStack = incidentUtils.getRedirectUrlForIncidentForm(actionVerb, newSysID);

		incidentUtils.copyIncidentAttachments(srcSysID, newSysID);
		incidentUtils.copyIncidentRelatedLists(srcSysID, newSysID);

		g_response.sendRedirect(urlOnStack);
	}
})(g_request, g_response, g_processor);