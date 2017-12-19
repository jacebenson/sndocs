var AppUpgrader = Class.create();
AppUpgrader.prototype = {
	
	CANNOT_INSTALL_OR_UPDATE : gs.getMessage("Insufficient privileges to install or update an application package"),
	DELETE_OLD_APP_PACKAGE : gs.getMessage("Deleting old application package"),
	INSTALL_APP_PACKAGE : gs.getMessage("Installing application package"),
	APP_IS_NOT_AVAILABLE: "Application unavailable for installation on this instance, app id: {0}",
	NO_ASSIGNED_VERSION: "Aborting upgrade of application: {0}, no assigned version specified",
	NO_UPGRADE_NECESSARY: "Application is already on desired version ({0}), no upgrade necessary for {1}",
	CANT_DOWNGRADE: "Application cannot be downgraded: {0}, from version: {1}, to version: {2}",	
	PLUGIN_DEPENDENCY_UNAVAILABLE: "Aborting upgrade of application: {0}, application depends on plugins which are not available on this instance: {1}",
	APP_DEPENDENCY_UNAVAILABLE: "Aborting upgrade of application: {0}, application depends on other applications which are not accessible at app store: {1}",
		
    initialize: function() {
		this._instanceId = gs.getProperty("instance_id");
		this._instanceName = gs.getProperty("instance_name");
		this._autoUpdateEnabled = gs.getProperty('sn_appclient.auto_update', 'true') == 'true';
		this.versionComparator = new VersionComparator();
		
		this._PARENT_TRACKER = GlideExecutionTracker.getLastRunning();
    },
	
	autoUpdates: function() {
		var updates = this._getAutoUpdates();
		for (var i = 0; i < updates.length; i++) {
			var update = updates[i];
			this.upgrade(update.source_app_id, update.latest_version, false);
		}		
	},
	
	/***
	 * Installs or updates store app to the specified version
	 */
	upgrade: /*boolean*/ function(/*source_app_id*/ appID, /*String*/ version, /*String*/ loadDemoData) {
		gs.info("upgrade(): appID={0}, version={1}, loadDemoData={2}", appID, version, loadDemoData);
		var storeApp = this._getOrCreateStoreApp(appID, version);
		if (!this._shouldInstallOrUpgrade(storeApp, version))
			return false;

		storeApp.assigned_version = version;
		storeApp.update();

		var installTracker = this._PARENT_TRACKER.createChildIfAbsent(this.INSTALL_APP_PACKAGE);
		installTracker.run();
		installTracker.incrementPercentComplete(2);		
		
		// Install new app package
		if (!this._installApplicationPackage(storeApp, loadDemoData == "true")) {
			var error = gs.getMessage("Unable to successfully install application package {0}:{1}", [storeApp.name, version]);
			gs.error(error);
			installTracker.fail(error);
			return false;
		}
		//if we got this far, we can safely remove the old sys_app_version records
		//anynewer versions will be downloaded next time UpdateChecker runs
		this._removeAppVersions(appID, version);
		
		gs.info("Successfully installed application {0}:{1}", storeApp.name, storeApp.version);
		installTracker.success();
		
		return true;
	},
	
	_getOrCreateStoreApp: /*GlideRecord sys_store_app*/ function(/*String*/ appID, /*String*/ version) {
		var storeApp = new GlideRecord("sys_store_app");
		if (!storeApp.get(appID))
			storeApp = this._convertToStoreApp(appID, version);
		
		this._setValuesFromVersion(storeApp, version);
		return storeApp;
	},
	
	_convertToStoreApp: /*GlideRecord sys_store_app*/ function (/*String*/ remoteAppId, /*String*/ version) {
		var remoteApp, storeApp;
		
		remoteApp = new GlideRecord("sys_remote_app");
		if (!remoteApp.get(remoteAppId))
			throw new Error("Unable to find expected remote app: " + remoteAppId);

		// create a new sys_store_app record, using sys_remote_app as a copy
		gs.info("Creating new sys_store_app " + remoteAppId + " from sys_remote_app entry");		
		storeApp = new GlideRecord("sys_store_app");
		storeApp.initialize();
		storeApp.setValue("sys_id", remoteAppId);
		storeApp.setNewGuidValue(remoteAppId);
		storeApp.setValue("name", remoteApp.getValue("name"));
		storeApp.setValue("scope", remoteApp.getValue("scope"));		
		storeApp.setValue("latest_version", version);
		storeApp.setValue("assigned_version", version);
		storeApp.setValue("vendor", remoteApp.getValue("vendor"));
		storeApp.setValue("vendor_prefix", remoteApp.getValue("vendor_prefix"));
		storeApp.setValue("short_description", remoteApp.getValue("short_description"));
		storeApp.setValue("key_features", remoteApp.getValue("key_features"));
		storeApp.setValue("release_notes", remoteApp.getValue("release_notes"));
		storeApp.setValue("dependencies", remoteApp.getValue("dependencies"));
		storeApp.setValue("demo_data", remoteApp.getValue("demo_data"));
		storeApp.setValue("auto_update", !!remoteApp.auto_update);
		storeApp.setValue("active", false); // when installed it'll become active

		storeApp.insert();
		if (!storeApp.isValidRecord())
			throw new Error("Unable to create new sys_store_app record: " + remoteAppId);

		// Reap sys_remote_app, since we now have a store app to install
		new GlideAppLoader().reapOldRemoteApp(remoteApp, storeApp);
		
		return storeApp;
	},
		
	_shouldInstallOrUpgrade: /*boolean*/ function(/*sys_store_app*/ storeApp, /*String*/ version) {
		var msg;
		if(!gs.hasRole('sn_appclient.app_client_user')) {
			msg = this.CANNOT_INSTALL_OR_UPDATE;
			gs.error(msg);
			this._PARENT_TRACKER.fail(msg);
			return false;
		}
		
		if (!storeApp.isValidRecord()) {
			msg = gs.getMessage(this.APP_IS_NOT_AVAILABLE, storeApp.sys_id);
			gs.error(msg);
			this._PARENT_TRACKER.fail(msg);
			return false;
		}
		
		var assignedVersion = this._cleanVersion(version);
		if (gs.nil(assignedVersion)) {
			msg = gs.getMessage(this.NO_ASSIGNED_VERSION, storeApp.name);
			gs.error(msg);
			this._PARENT_TRACKER.fail(msg);
			return false;
		}
		
		var installedVersion = this._cleanVersion(storeApp.version);
		if (assignedVersion == installedVersion && storeApp.active) {
			msg = gs.getMessage(this.NO_UPGRADE_NECESSARY, [assignedVersion, storeApp.name]);
			gs.info(msg);
			this._PARENT_TRACKER.success(msg);
			return false;
		}
		
		/** installed = from/current, assigned = to/target */
		if (this._isDowngrade(installedVersion, assignedVersion)) {
			msg = gs.getMessage(this.CANT_DOWNGRADE, [storeApp.name, installedVersion, assignedVersion]);
			gs.error(msg);
			this._PARENT_TRACKER.fail(msg);
			return false;
		}
		
		this._checkCompatibility(storeApp, version);

		if (this._unavailableDepPlugins != "") {
			msg = gs.getMessage(this.PLUGIN_DEPENDENCY_UNAVAILABLE, [storeApp.name, this._unavailableDepPlugins]);
			gs.error(msg);
			this._PARENT_TRACKER.fail(msg);
			return false;
		}

		if (this._inaccessibleDepApps != "") {
			msg = gs.getMessage(this.APP_DEPENDENCY_UNAVAILABLE, [storeApp.name, this._inaccessibleDepApps]);
			gs.error(msg);
			this._PARENT_TRACKER.fail(msg);
			return false;
		}

		return true;
	},
	
	_setValuesFromVersion : function(/*GlideRecord sys_store_app*/ storeApp, /*String*/ version) {
		var versionGr = new GlideRecord('sys_app_version');
		versionGr.addQuery("source_app_id", storeApp.getValue("sys_id"));
		versionGr.addQuery("version", version);
		versionGr.query();
		
		if (versionGr.getRowCount() == 1 && versionGr.next()) {
			//update release notes, dependencies, etc
			storeApp.setValue("auto_update", versionGr.getValue("auto_update"));
			storeApp.setValue("demo_data", versionGr.getValue("demo_data"));
			storeApp.setValue("dependencies", versionGr.getValue("dependencies"));
			storeApp.setValue("key_features", versionGr.getValue("key_features"));
			storeApp.setValue("name", versionGr.getValue("name"));
			storeApp.setValue("release_notes", versionGr.getValue("release_notes"));
			storeApp.setValue("short_description", versionGr.getValue("short_description"));
			
			this._setValuesFromManifest(storeApp, version);

		}
			
	},
	
	_setValuesFromManifest: function(/*GlideRecord sys_store_app */ storeApp, /*string*/ version) {
		var manifestService = new ManifestService();
		var manifest = manifestService.getManifestForAppVersion(storeApp.getValue("sys_id"), version);
		var mapRepo, map, source, target, i;

		if (manifest && manifest.hasOwnProperty("additional_fields")) {
			mapRepo = new ManifestFieldMap(manifest);
			for (i = 0; i< manifest.additional_fields.length; i++) {
				source = manifest.additional_fields[i];
				map = mapRepo.getMap(source.field_name);
				target = map(source);
				
				gs.debug("Setting field {0} to {1}, from manifest", target.field_name, target.value);
				if (storeApp.isValidField(target.field_name))
					storeApp.setValue(target.field_name, target.value);
			}
		}
	},
	
	_cleanVersion: /*String*/ function(/*String*/ version) {
		if (gs.nil(version))
			return '';
		
		return (version+'').trim();
	},
	
	/**
	 * Analyzes dependencies for the installing app. 
	 * Produces this._unavailableDepPlugins and this._inaccessibleDepApps CSV lists as result of its execution.
	 */
	_checkCompatibility: /*void*/ function(/*sys_store_app*/ storeApp, /*String*/ version) {
		this._unavailableDepPlugins = ""; // comma-separated list of dependency plugins which are unavailable at this instance 
		this._inaccessibleDepApps = ""; // comman-seprated list of dependency apps which are unavailable at app store
		var dependencies = storeApp.dependencies + "";
		gs.info("_checkCompatibility: dependencies = " + dependencies);
		if (gs.nil(dependencies))
			return;

		var depArray = dependencies.split(",");
		var dependencyApps = "";
		for (var i = 0; i < depArray.length; i++) {
			var depPair = depArray[i].split(":"); // pair of dependency id and version
			if (depPair.length > 0 && gs.nil(depPair[0]))
				continue;
			
			if (depPair.length < 2 || depPair[1] == "sys") { // handle plugin dependencies
				var name = depPair[0];
				if (name.startsWith("apps/") || name.startsWith("glidesoft"))
					continue;
				
				gs.info("_checkCompatibility: dependency = " + depPair[0]);
				var isPluginActive = GlidePluginManager.isActive(depPair[0]);
				if (!isPluginActive) {
					if (this._unavailableDepPlugins != "")
					 	this._unavailableDepPlugins += ",";
					 this._unavailableDepPlugins += depPair[0];
				}
			} else if (depPair.length == 2) { // accumulate app dependencies for further validation at app store
				if (dependencyApps != "")
					 dependencyApps += ",";
				dependencyApps += depArray[i];
			}
		}

		gs.info("_checkCompatibility: this._unavailableDepPlugins = " + this._unavailableDepPlugins);
		gs.info("_checkCompatibility: dependencyApps = " + dependencyApps);
		// now validate app dependencies at app store
		if (dependencyApps != "") {
			var request = new AppRepoRequest("checkaccess")
				.setParameter("sysparm_apps", dependencyApps);
			var result = request.getJSON();
			gs.info("request.getStatus=="+request.getStatusCode() + ", error=="+request.getErrorMessage());
			if (result) {
				for (var i = 0; i < result.inaccessible.length; i++) {
					if (this._inaccessibleDepApps != "")
						 this._inaccessibleDepApps += ",";
					this._inaccessibleDepApps += result.inaccessible[i].app_scope + ":" + result.inaccessible[i].min_req_version;
				}
			} else { // something wrong with app store?
				this._inaccessibleDepApps = dependencyApps;
			}
		}
		gs.info("_checkCompatibility: this._inaccessibleDepApps = " + this._inaccessibleDepApps);
	},
	
	_installApplicationPackage: /*boolean*/ function(/*sys_store_app*/ storeApp, /*Boolean*/ loadDemoData) {
		gs.info("Installing or upgrading application: " + storeApp.name + ", loadDemoData: " + loadDemoData);
		return new GlideAppLoader().installOrUpgradeApp(storeApp.getUniqueValue(), /* deprecated */ "", loadDemoData);
	},
	
	_isDowngrade: /*boolean */ function(/*from version*/ currentVersion, /* to version */ targetVersion) {
		return this.versionComparator.isDowngrade(currentVersion, targetVersion);
	},
	
	_getAutoUpdates: /*[{source_app_id,latest_version},...]*/ function() {
		var updates = [];
		
		if (!this._autoUpdateEnabled) {
			gs.info('Skipping app auto-updates (behavior was disabled via property override)');
			return updates;
		}
		
		var storeApp = new GlideRecord('sys_store_app');
		if (!storeApp.isValidField('auto_update')) {
			gs.info('Skipping app auto-updates (field sys_store_app.auto_update not found)');
			return updates;
		}
		
		storeApp.addQuery('auto_update', true);
		storeApp.addNotNullQuery('version');
		storeApp.addNotNullQuery('latest_version');
		storeApp.query();
		gs.info('Got ({0}) candidate records to check for auto-update on', storeApp.getRowCount());
		while (storeApp.next()) {
			var installedVersion = this._cleanVersion(storeApp.getValue('version'));
			var latestVersion = this._cleanVersion(storeApp.getValue('latest_version'));
			if (gs.nil(latestVersion) || latestVersion == installedVersion)
				continue;
			
			var assignedVersion = this._cleanVersion(storeApp.getValue('assigned_version'));
			if (latestVersion == assignedVersion)
				continue; // upgrade in progress
				
			var source_app_id = storeApp.getUniqueValue();
			var scope = storeApp.scope.toString();	
			gs.info('Auto-update store app {0} ({1}) from {2} to {3}', 
				scope, source_app_id, installedVersion, latestVersion);
			
			var update = { source_app_id: source_app_id, scope: scope, latest_version: latestVersion };
			updates.push(update);
		}
		if (storeApp.getRowCount() > 0)
			gs.info('({0}) apps to auto-update', updates.length);
		
		return updates;
	},
	
	_removeAppVersions : function(/*string*/ source_app_id, version) {
		//we either installed for the first time, or updated an existing app
		var appVersions = new GlideRecord("sys_app_version");
		appVersions.addQuery("source_app_id", source_app_id);
		appVersions.query();

		while (appVersions.next()) {
			gs.info("Comparing {0} to {1}, is {1} an upgrade? {2}", version, appVersions.getValue("version"), this.versionComparator.isUpgrade(version, appVersions.getValue("version")));
			if (!this.versionComparator.isUpgrade(version, appVersions.getValue("version")))
				appVersions.deleteRecord();
			else {
				appVersions.setValue("remote_app", "");
				appVersions.setValue("store_app", source_app_id);
				appVersions.update();
			}
		}
	},
	
    type: 'AppUpgrader'
};