getUploadInfo(g_processor);

function getUploadInfo(g_processor) {
	var warningMsg = checkAppDependencies();
	var vendorInfo = new sn_appauthor.ScopedAppVendorInfoObtainer().obtainFromAppRepo();
	
	if (gs.nil(vendorInfo)) {
		CacheBuster.addNoCacheHeaders(g_response);
		g_processor.writeOutput("application/json", new global.JSON().encode({}));
		return;
	}
	
	var key = vendorInfo.key || '';
	var company = vendorInfo.name || '';
	var allowInternalUpload = vendorInfo.allow_internal_upload || false;
	var allowStoreUpload = vendorInfo.allow_store_upload || false;
	
	var json = {
		"targetUrl" : getUploadUrls(),
		"ck" : gs.getSession().getSessionToken(),
		"dependencyWarningMsg" : warningMsg,
		"companyKey" : key,
		"companyName" : company,
		"allowInternalUpload" : allowInternalUpload,
		"allowStoreUpload" : allowStoreUpload
	};
	
	CacheBuster.addNoCacheHeaders(g_response);
	g_processor.writeOutput("application/json", new global.JSON().encode(json));
}

function checkAppDependencies() {
	var appId = g_request.getParameter("sysparm_sys_id");
	if(!appId)
		return gs.getMessage('The application identifier is invalid');
			
	var dependencyChecker = new sn_appauthor.ScopedAppDependencyChecker();
	var inaccessibleApps = dependencyChecker.checkInaccessibleDeps(appId);
	
	var warningMsg = '';
	if (!gs.nil(inaccessibleApps)) {
		warningMsg = gs.getMessage('The application has dependencies which are not accessible in the App Repository: {0}. Do you want to continue?', [inaccessibleApps]);
	}
	
	return warningMsg;
}

function checkAppVersion() {
	var versionInfo, local_version, warningMsg = '';
	var appId = g_request.getParameter("sysparm_sys_id");
	if(!appId)
		appId = "ZZYYTHISISANINVALIDIDWOOOOOOYYZZ";
	
	var gr = new GlideRecord('sys_app');
	if (gr.get(appId)) {
		local_version = gr.getValue('version')||'';
		versionInfo = new sn_appauthor.ScopedAppVendorInfoObtainer()
							  .obtainDisplayVersionFromAppRepo(appId, local_version, false);
		
		if (!versionInfo.allowed && versionInfo.errorMessage) {
			gs.error("Unable to upload this version. Error is " + versionInfo.errorMessage);
			warningMsg = versionInfo.errorMessage;
		}
	}
	
	if(warningMsg)
		warningMsg = gs.getMessage('The application version {0} already exists on the repository. To Publish, you will need to increment the version on the next page.', local_version);
	
	return warningMsg;
}

function getUploadUrls() {
	var uploadUrl = gs.getProperty("sn_appclient.upload_base_url") || gs.getProperty("sn_appauthor.upload_base_url") || '';
	
	if (gs.nil(uploadUrl)) {
		var devUrl = gs.getProperty("sn_appclient.dev_repository_base_url");
		var prodUrl = gs.getProperty("sn_appclient.repository_base_url");
		var isDev = gs.getProperty("glide.installation.developer", "false") == "true";
		uploadUrl = isDev ? devUrl : prodUrl;
	}
	
	if (!uploadUrl.endsWith("/"))
		uploadUrl += "/";
	
	return uploadUrl.split(',');
}