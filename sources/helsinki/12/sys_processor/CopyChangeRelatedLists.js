(function process(g_request, g_response, g_processor) {
	// derive required parameters
	var actionVerb = j2js(g_request.getParameter('sysparm_returned_action'));
	var srcSysID = j2js(g_request.getParameter("srcSysID"));
	var newSysID = j2js(g_request.getParameter("newSysID"));

	// Continue further if all required parameters are present.
	if (JSUtil.nil(actionVerb) || actionVerb === '' || JSUtil.nil(srcSysID) || srcSysID === '' || JSUtil.nil(newSysID) || newSysID === '')
		gs.log('com.snc.change_request - processor - CopyChangeRelatedLists - Required parameters missing');
	else {
		var changeUtils = new ChangeUtils();
		var urlOnStack = "";
		if (changeUtils.isVerbBack(actionVerb))
			urlOnStack = changeUtils.getRedirectUrlForChangeForm(actionVerb, srcSysID);
		else {
			urlOnStack = changeUtils.getRedirectUrlForChangeForm(actionVerb, newSysID);

			// Copy Change attachments if enabled
			changeUtils.copyChangeAttachments(srcSysID, newSysID);

			// pass on source sys id , new sys id for util function to complete copy related lists. Util is expected to
			// return true on success.
			var answer = changeUtils.copyChangeRelatedLists(srcSysID, newSysID);

			// if API status is true all was ok. If no , still redirect to the URL on stack. All warning messages will
			// be put in the util.
			if (!answer)
				gs.log('com.snc.change_request - processor - CopyChangeRelatedLists - Warnings present in ChangeUtils.copyChangeRelatedLists');
		}

		g_response.sendRedirect(urlOnStack);
	}
})(g_request, g_response, g_processor);