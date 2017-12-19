(function() {

	getTree(g_request, g_processor);

	function getTree(g_request, g_processor) {
		var appId = g_request.getParameter("sysparm_transaction_scope");
		var projectInfo, projectTree, project;
		if(!appId) {
			projectInfo = {};
			projectTree = [];
		}
		else {
			projectInfo = getProjectInfo(appId);
			projectTree = ProjectNavigator.getProjectTree(appId);
		}
		
		project = {
			metadata : projectInfo,
			artifacts : projectTree
		};
		
		CacheBuster.addNoCacheHeaders(g_response);
		g_processor.writeOutput("application/json", new global.JSON().encode(project));
	}
	
	function getProjectInfo(appId) {
		var isPublishable;
		var gr = new GlideRecord('sys_app');
		if (gr.get("sys_id",appId) && gr.getValue('scope') !== 'global')
			isPublishable = true;
		var name = gr.getValue('name') || '';
		var version = gr.getValue('version') || 'N/A';
		
		var hasLocalChanges = 
			typeof sn_vcs !== 'undefined' && 
			typeof sn_vcs.AppSourceControl !== 'undefined' &&
			sn_vcs.AppSourceControl.hasOutgoingChanges(appId);
		
		// Fixing legacy default version number
		if (version === '1.0') version = '1.0.0';

		return {
			appId : appId,
			name : name,
			version : version,
			publishable : isPublishable,
			hasLocalChanges : hasLocalChanges
		};
	}
})();