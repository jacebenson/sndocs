var type = (g_request.getParameter("app_request_type")||'').toLowerCase();

switch (type) {
	case "list_apps":
		listApps();
		break;
	case "install_and_update_apps":
		installAndUpdateApps();
		break;
	case "get_install_status":
		getInstallStatus();
		break;
	case "list_apps_versions":
		listAppsVersions();
		break;
	default:
		g_response.setStatus(400);
		gs.error("Unknown type: " + app_request_type);
}

function listApps() {
	var allApps = new AppsData();
	var data = allApps.getAllApps();
	var encodedResponse = new global.JSON().encode(data);
	g_processor.writeOutput("application/json", encodedResponse);
	g_response.setStatus(200);
}

function listAppsVersions() {
	var allApps = new AppsData();
	var data = allApps.getAllAppsWithVersions();
	var encodedResponse = new global.JSON().encode(data);
	g_processor.writeOutput("application/json", encodedResponse);
	g_response.setStatus(200);
}

function installAndUpdateApps() {
	var appID = g_request.getParameter('app_id');
	var version = g_request.getParameter('version');
	var loadDemoData = g_request.getParameter('loadData');
	gs.info("Download app: {0}, version: {1}, loadDemoData: {2}", appID, version, loadDemoData);
	
	var progress_name = "Install Application";
	var worker = new GlideScriptedHierarchicalWorker();
	worker.setProgressName(progress_name); 
	worker.setBackground(true);
	worker.setCannotCancel(true);
	worker.setScriptIncludeName("sn_appclient.AppUpgrader");
	worker.setScriptIncludeMethod("upgrade");
	worker.putMethodArg("appID", appID);
	worker.putMethodArg("version", version);
	worker.putMethodArg("loadDemoData", loadDemoData);
	worker.start();
    
	var trackerId = worker.getProgressID();
	var jsonResponse = {};
    jsonResponse.trackerId = trackerId; 

	var encodedResponse = new global.JSON().encode(jsonResponse);
	g_processor.writeOutput("application/json", encodedResponse);
	g_response.setStatus(200);
}

function getInstallStatus() {
	var execId = g_request.getParameter('execId');
	var progressTracker = new ProgressTracker();
	var data = progressTracker.getStatus(execId);
	gs.info(data);
	g_processor.writeOutput("application/json", data);
	g_response.setStatus(200);
}