var UpdateChecker = Class.create();
UpdateChecker.prototype = {
    initialize: function() {
		this._quiet = gs.getProperty("sn_appclient.http_check_updates_quietly", "true") == "true";
		this.json = new global.JSON();
		this.versionComparator = new VersionComparator();
    },

	/**
	 * Check central app repo for available updates
	 * Refreshes the local data model and UI to reflect any changes
	 */
	checkAvailableUpdates:/*void*/ function() {
		gs.info("checkAvailableUpdates()");
		var i, updates, update, newestVersions, app;
		//get the update object
		updates = this._getAvailableUpdates();
		
		//delete existing sys_remote_apps if they aren't in the updates
		this._removeInaccessibleRemoteApps(updates);
		
		//remove apps where a local version exists
		updates = this._filterLocalApps(updates);
		
		//this gets an array of objects in the old style
		newestVersions = this._getMostRecentVersions(updates);
		gs.info("Done removing inaccessible remote apps.");
		
		//update the latest versions fields
		newestVersions = this._filterWhereServerUpdateIsMoreRecent(newestVersions);
		
		gs.info("Newest versions length is {0}", newestVersions.length+'');
		// update latest version information
		for (i = 0; i < newestVersions.length; i++) {
			gs.debug("Saving latest version");
			update = newestVersions[i];
			this._updateLatestVersionFields(update);
			
			// update logos
			app = this._getApp(update.source_app_id);
			if (app !== null) {
				gs.info("Updating logo for: {0}", this.json.encode(update));
				new LogoDownloader().updateLogo(app);
			}
		}
		
		//save all the version records
		for (i = 0; i < updates.length; i++) {
			update = updates[i];
			gs.debug("Saving versions for {0}", update.source_app_id);

			app = this._getApp(update.source_app_id);
			this._refreshVersions(app, update);
		}
		
		this._accountForWithdrawnApps(updates);
		
		this._getManifestsSlowly();
	},

	/**
	 * Retrieves available updates for this instance from the central app repository
	 */
	_getAvailableUpdates: /*[sys_store_app,...]*/ function() {
		var gu = new GlideUpgradeUtil();
		var parms = {
			glide_build: gu.getCurrentBuild(),
			glide_build_name: gu.getCurrentBuildName(),
			applications: this._getInstalledApplicationsJSON()
		};
		var candidateUpdateResponse = new AppRepoRequest("get_available_apps")
					.setParameter("glide_build", parms.glide_build)
					.setParameter("glide_build_name", parms.glide_build_name)				
					.setParameter("applications", parms.applications)
					.setQuiet(this._quiet)
					.post();
		
		//if talking to localhost response will be 200-OK but content is Page not Found
		var candidateUpdates = [];
		try {
			candidateUpdates = this.json.decode(candidateUpdateResponse);
		} catch (e) {
			gs.error("Unable to parse response from App Repo. The server may not be active >> {0}", candidateUpdateResponse);
		}
		
		if (null == candidateUpdates || typeof candidateUpdates.push !=='function')
			candidateUpdates = [];
		
		gs.debug("Got ({0}) candidate updates: {1}", candidateUpdates.length, this.json.encode(candidateUpdates));
		
		return candidateUpdates;
	},

	_getInstalledApplicationsJSON: function() {
		var applications = new GlideRecord("sys_scope");
		applications.addQuery("sys_class_name", "IN", "sys_store_app,sys_app");
		applications.addQuery("sys_id", "!=", "global");
		applications.query();
		var appRay = [];
		while (applications.next()) {
			var app = {
				source_app_id: applications.sys_id.toString(),
				source: applications.source.toString(),
				scope: applications.scope.toString(),
				active: applications.active.toString(),
				version: applications.version.toString()+'',
				vendor: applications.vendor.toString()+'',
				vendor_prefix: applications.vendor_prefix.toString()+'',
				sys_class_name: applications.sys_class_name.toString()+'',
				name: applications.name.toString()+'',
				scoped_administration: applications.scoped_administration.toString()+''
			};
			appRay.push(app);
		}
		var text = this.json.encode(appRay);
		return text;
	},

	/*
	* Deletes sys_remote_app records if the records sys_id isn't provided as one of the
	* apps sent by the store
	*/
	_removeInaccessibleRemoteApps: /*void*/ function(/*array of Hash*/ updates) {
		gs.debug("Removing all inaccessible apps");
		var accessible = {};
		for (var i = 0; i < updates.length; i++) {
			var update = updates[i];
			accessible[update.source_app_id] = true;
		}
		var allRemoteApps = new GlideRecord("sys_remote_app");
		allRemoteApps.query();
		while (allRemoteApps.next()) {
			var candidate_app_id = allRemoteApps.sys_id.toString();
			var candidate_scope = allRemoteApps.scope.toString();
			if (typeof accessible[candidate_app_id] == 'undefined') {
				gs.info("Removing inaccessible sys_remote_app: {0} ({1})", candidate_scope, candidate_app_id);
				allRemoteApps.deleteRecord();
				
				gs.info("Removing sys_app_versions for deleted sys_remote_app {0}", candidate_app_id);
				this._removeVersionsForApp(candidate_app_id);
			}
		}
	},
	
	_filterLocalApps: /*array*/function (/*array of hashes*/ updates) {
		var nonLocals = [];
		for (var i=0; i<updates.length; i++) {
			var update = updates[i];
			if (this._localAppExistsFor(update)) {
				gs.info("Removing local app {0} ({1}) because a local sys_app record already exists",
					update.app_name, update.source_app_id);
				continue;
			}
			nonLocals.push(update);
		}
		return nonLocals;
	},
	
	_filterWhereServerUpdateIsMoreRecent: /*[sys_store_app,...]*/ function(/*array of Hash*/ updates) {
		var answer = [];
		for (var i = 0; i < updates.length; i++) {
			var update = updates[i];
			var app = this._getApp(update.source_app_id);
			
			gs.debug("Checking app update {0}:{1} ({2})", update.scope, update.version, update.source_app_id);
			var includeUpdate = false;
			var includeReason = null;
			if (app === null) {
				includeUpdate = true;
				includeReason = "New app";
			} else if (!this._areEqual(app.latest_version, update.version)) {
				includeUpdate = true;
				includeReason = "New version (" + app.latest_version + "/" + update.version + ")";
			} else if (!this._areEqual(app.dependencies, update.dependencies)) {
				includeUpdate = true;
				includeReason = "Dependency change";				
			} else if (!this._areEqual(app.short_description, update.short_description)) {
				includeUpdate = true;
				includeReason = "Short description change";
			} else if (!this._areEqual(app.name, update.app_name)) {
				includeUpdate = true;
				includeReason = "Name change";				
			} else if (!this._areEqual(app.release_notes, update.release_notes)) {
				includeUpdate = true;
				includeReason = "Release notes change";
			} else if (!this._areEqual(app.key_features, update.key_features)) {
				includeUpdate = true;
				includeReason = "Key features change";
			} else if (app.isValidField('auto_update')
						&& update.hasOwnProperty('auto_update') 
						&& !this._areEqualBoolean(app.auto_update, update.auto_update)){
				includeUpdate = true;
				includeReason = "Auto update change";
			}			
		
			if (includeUpdate) {
				answer.push(update);
				gs.debug("Including app update {0}:{1} ({2}) - {3}", update.source_app_id, update.version, update.scope, includeReason);
			}
		}
		return answer;
	},
	
	_isDowngrade: /*boolean */ function(/*from version*/ currentVersion, /* to version */ targetVersion) {
		return this.versionComparator.isDowngrade(currentVersion, targetVersion);
	},

	_updateLatestVersionFields: /*boolean*/ function(/*Hash*/ update) {
		gs.info("Updating latest version for {0}", update.source_app_id);
		
		if (this._localAppExistsFor(update)) {
			gs.info("Skipping app insert of {0} ({1}) because a local sys_app record already exists",
					update.app_name, update.source_app_id);
			return;
		}
		
		var app = this._getApp(update.source_app_id);
		//no app so make remote_app record
		if (app == null)
			app = this._createRemoteApp(update);
		
		this._updateApp(app, update);
	},

	_updateApp: /*void*/ function(/*GlideRecord sys_remote_app | sys_store_app*/ app, /*{}*/ update) {
		if (this.versionComparator.isUpgrade(app.getValue("latest_version"), update.version)) {
			app.setValue("latest_version", update.version);
			gs.info("Updated latest version info for: {0}", this.json.encode(update));
		}
		app.setValue("name", update.app_name + '');
		app.setValue("dependencies", update.dependencies + '');
		app.setValue("short_description", update.short_description+'');
		app.setValue("key_features", update.key_features+'');
		app.setValue("release_notes", update.release_notes+'');
		if (app.isValidField("auto_update"))
			app.setValue("auto_update", update.auto_update);
		app.setWorkflow(true); // ensure workflow is enabled
		app.update();
	},
	
	_localAppExistsFor: /*boolean*/ function(update) {
		var scopeRecord = new GlideRecord("sys_app");
		if (!scopeRecord.isValid())
		    return false;
		scopeRecord.addQuery("sys_id", update.source_app_id);
		scopeRecord.query();
		return scopeRecord.next();
	},

	_createRemoteApp: /*gliderecord*/ function(/*{sys_id,name,scope,version,description}*/ update) {
		gs.info("Creating sys_remote_app for: {0}", this.json.encode(update));
		var gr = new GlideRecord("sys_remote_app");
		gr.initialize();
		
		if (update.hasOwnProperty("source_app_id") && update.source_app_id) {
			gr.setValue("sys_id", update.source_app_id);
			gr.setNewGuidValue(update.source_app_id);
		}
		
		gr.setValue("name", update.app_name);
		gr.setValue("scope", update.scope);
		gr.setValue("latest_version", update.latest_version||update.version);
		gr.setValue("vendor", update.vendor);
		gr.setValue("short_description", update.short_description+'');
		gr.setValue("key_features", update.key_features+'');
		gr.setValue("release_notes", update.release_notes+'');		
		gr.setValue("dependencies", update.dependencies);		
		
		if (gr.isValidField('auto_update'))
			gr.setValue("auto_update", update.auto_update);
		
		if (update.has_demo_data == "true")
			gr.setValue("demo_data", "has_demo_data");
		else
			gr.setValue("demo_data", "no_demo_data");		
		
		if (gr.isValidField('publish_date'))
			gr.setValue("publish_date", update.publish_date+'');
		
		gr.insert();
		return gr;
	},
	
	_refreshVersions : /*void*/ function(/*GlideRecord sys_store_app | sys_remote_app */app, /*{}*/ updates) {
		//updates is the app object which has all the version info
		var appField = (app.getRecordClassName() == "sys_store_app")  ? "store_application" : "remote_application";
		var gr = new GlideRecord("sys_app_version");
		var version;
		
		if (!gr.isValid())
			return;
		
		//run through and delete old versions
		for (var i = 0; i< updates.versions.length; i++) {
			//delete downgrade version records
			version = updates.versions[i];
			if (app.isValidField("version") && !this.versionComparator.isUpgrade(app.getValue("version"), version.version)) {
				gs.info("Deleting unneeded app version {0} for app {1}", version.version, app.getValue("sys_id"));
				gr.addQuery("source_app_id", app.getValue("sys_id"));
				gr.addQuery("version", version.version);
				gr.query();
				gr.deleteMultiple();
			}
		}
		//run through and create new records or update existing ones
		for (i = 0; i< updates.versions.length; i++) {
			//we should only store those which are an upgrade
			version = updates.versions[i];
			gs.debug("Saving or updating sys_app_version record for {0} : {1} ({2})", app.getValue("name"), version.version, app.getValue("sys_id"));
			if (app.isValidField("version") && !this.versionComparator.isUpgrade(app.getValue("version"), version.version))
				continue;
			
			gr.initialize();
			gr.addQuery("source_app_id", app.getValue("sys_id"));
			gr.addQuery("version", version.version);
			gr.query();
			
			if (!gr.next())
				gr.newRecord();
			
			gr.setValue(appField, app.getValue("sys_id"));
			gr.setValue("source_app_id", updates.source_app_id+'');
			gr.setValue("name", updates.app_name+'');
			gr.setValue("title", version.title+'');
			gr.setValue("number", version.app_number+'');
			gr.setValue("scope", updates.scope+'');
			gr.setValue("version", version.version+'');
			gr.setValue("vendor", updates.vendor+'');
			gr.setValue("vendor_key",updates.vendor_key+'');
			gr.setValue("short_description", version.short_description+'');
			gr.setValue("key_features", version.key_features+'');
			gr.setValue("release_notes", version.release_notes+'');		
			gr.setValue("dependencies", version.dependencies);		
			gr.setValue("publish_date", version.publish_date+'');
			if (version.has_demo_data == "true")
				gr.setValue("demo_data", "has_demo_data");
			else
				gr.setValue("demo_data", "no_demo_data");		
			
			if (gr.isNewRecord())
				gr.insert();
			else
				gr.update();
		}
	},
	
	_removeVersionsForApp: function(/*string*/ app_id) {
		var versionRecords = new GlideRecord("sys_app_version");
		versionRecords.addQuery("remote_application",app_id);
		versionRecords.query();
		
		gs.info("Deleting {0} sys_app_version records.", versionRecords.getRowCount());
		versionRecords.deleteMultiple();
	},

	_getApp: /*GlideRecord sys_store_app | sys_remote_app */ function(/*string*/ sys_id) {
		var gr = new GlideRecord("sys_store_app");
		gr.addQuery("sys_id", sys_id);
		gr.query();
		if (gr.next())
			return gr;
		
		gr = new GlideRecord("sys_remote_app");
		gr.addQuery("sys_id", sys_id);
		gr.query();
		if (gr.next())
			return gr;
		
		return null;
	},
	
	/*
	 * For existing sys_store_apps where the most recent version
	 * from the store is *lower* than what is currently installed
	 * or where no recent version was sent down, we want to treat
	 * the app as if it already has the latest version installed.
	 * This happens when an app version has been withdrawan from
	 * the store, that version has already been installed on an
	 * instance, but a higher-version replacement is not yet
	 * available.
	 * For remote apps, we want to remove any versions that aren't
	 * in the list of updates, as well as properly set the latest
	 * version to the appropriate highestVersion.
	 */
	_accountForWithdrawnApps: function(/*{}*/ updates) {
		var appId, appName, currentVersion, latestVersion, allHighestVersions, allVersions, highestPossibleVersion;
		
		allHighestVersions = this._getMostRecentVersions(updates);
		allVersions = this._getAllVersions(updates);
		
		var store_app = new GlideRecord("sys_store_app");
		store_app.query();
		
		var remote_app = new GlideRecord("sys_remote_app");
		remote_app.query();
		
		var app_version = new GlideRecord("sys_app_version");
		
		//fix store_app versions
		while (store_app.next()) {
			appId = store_app.getValue("sys_id");
			appName = store_app.getValue("name");
			currentVersion = store_app.getValue("version");
			latestVersion = store_app.getValue("latest_version");
			highestPossibleVersion = '';
			
			gs.debug("Ensuring app version records for installed app {0} are valid", appId);
			
			if (this._versionArrayContains(allHighestVersions, appId)) {
				highestPossibleVersion = this._getHighestVersionNumber(appId, allHighestVersions);
				gs.debug("The repo says the highest possible version for {0} is {1}", appName, highestPossibleVersion);
				
				this._deleteHigherVersions(appId, highestPossibleVersion);
				
				if (store_app.getValue("latest_version") != highestPossibleVersion) {
					gs.debug("Setting the latest version for app {0} to the highest possible version {1}",
							  appName, highestPossibleVersion);
					
					store_app.setValue("latest_version", highestPossibleVersion);
					store_app.update();
				}
				
			} else {
				gs.debug("The repo didn't send us any information about source app {0} ({1}), deleting all versions",
						 appId, appName);
				
				this._deleteAllVersions(appId);
				
				if(store_app.getValue("latest_version") != currentVersion) {
					gs.debug("Also, the latest version ({0}) is being reset to the current value ({1})",
							  store_app.getValue("latest_version"), currentVersion);
					
					store_app.setValue("latest_version", currentVersion);				
					store_app.update();
				}
			}
		}
		
		//fix remote_app versions
		while (remote_app.next()) {
			appId = remote_app.getValue("sys_id");
			appName = remote_app.getValue("name");
			latestVersion = remote_app.getValue("latestVersion");
			highestPossibleVersion = '';
			
			gs.debug("Ensuring app version records for remote app {0} are valid", appId);
			
			if (!this._versionArrayContains(allHighestVersions, appId)) {
				gs.debug("The repo didn't send us any information about remote app {0} ({1}), deleting all versions",
						 appId, appName);
				
				this._deleteAllVersions(appId);
				
			} else {
				highestPossibleVersion = this._getHighestVersionNumber(appId, allHighestVersions);
				gs.debug("The repo says the highest possible version for {0} is {1}", appName, highestPossibleVersion);
				
				this._deleteHigherVersions(appId, highestPossibleVersion);
				
				if (remote_app.getValue("latest_version") != highestPossibleVersion) {
					gs.debug("Setting the latest version for app {0} to the highest possible version {1}", appName, highestPossibleVersion);
					remote_app.setValue("latest_version", highestPossibleVersion);				
					remote_app.update();
				}
			}
		}
		
		//delete all sys_app_versions that aren't in the updates sent from the store
		//query here because previous loops may have deleted some version records
		app_version.query();
		while (app_version.next()) {
			appId = app_version.getValue("source_app_id");
			currentVersion = app_version.getValue("version");
			
			if (!this._versionArrayContainsVersion(allVersions, appId, currentVersion)) {
				gs.debug("Deleting sys_app_version record {0} : {1} ({2}) because it is not in the updates sent from the store.",
						 app_version.getValue("name"), currentVersion, app_version.getValue("number"));
				app_version.deleteRecord();
			}
		}
		
	},
		
	_deleteAllVersions: function (/*string*/ appId) {
		gs.debug("Deleting all app versions for source app {0}", appId);
		var app_versions = new GlideRecord("sys_app_version");
		app_versions.addQuery("source_app_id", appId);
		app_versions.query();
			
		gs.debug("Number of version records to delete: {0}", app_versions.getRowCount());
		app_versions.deleteMultiple();	
	},
		
	_deleteHigherVersions: function (/*string*/ appId,/*string*/ highestPossibleVersion) {
		if (!highestPossibleVersion)
			return;
			
		gs.debug("Deleting app versions for appId {0} higher than {1}", appId, highestPossibleVersion);
			
		var app_versions = new GlideRecord("sys_app_version");
		app_versions.addQuery("source_app_id",appId);
		app_versions.query();
			
		while (app_versions.next()) {
			if (this.versionComparator.isUpgrade(highestPossibleVersion, app_versions.getValue("version"))) {
				gs.debug("Deleting sys_app_version record for {0} version {1} because it is higher than the newest version ({2})",
						 app_versions.getValue("name"), app_versions.getValue("version"), highestPossibleVersion);
						
				app_versions.deleteRecord();
			}
		}
	},
	
	_versionArrayContains : /*boolean*/ function(/*[{}]*/ versionArray,/*string*/ appId) {
		for (var i = 0; i< versionArray.length; i++) {
			var newestVersion = versionArray[i];
			if (newestVersion.source_app_id == appId)
				return true;
		}
		return false;
	},
	
	_versionArrayContainsVersion: /*boolean*/ function( /*[{}]*/ versionArray,/*string*/ appId,/*string*/ version) {
		for (var i = 0; i< versionArray.length; i++) {
			var versionData = versionArray[i];
			if (versionData.source_app_id == appId && versionData.version == version)
				return true;
		}
		return false;
	},
	
	_getAllVersions: /*[{}]*/ function(/*{}*/ updates) {
		var versions = [];
		for (var i=0; i<updates.length; i++) {
			
			var update = updates[i];
			if (this._localAppExistsFor(update))
				continue;
			
			for (var j = 0; j< update.versions.length; j++) {
				var versionObject = this.json.decode(this.json.encode(update.versions[j]));
				versionObject.source_app_id = update.source_app_id + '';
				versions.push(versionObject);
			}
				
		}
		
		return versions;		
	},
	
	_getMostRecentVersions: /*[{}]*/ function(/*{}*/ updates) {
		var versions = [];
		for (var i=0; i<updates.length; i++) {
			var update = updates[i];
			
			if (this._localAppExistsFor(update))
				continue;
			
			//doesn't just return the version object, it modifies it slightly to old format
			var highestObj = { version : 0 };
		
			for (var j = 0; j< update.versions.length; j++) {
				var candidate = update.versions[j];
				if (!this._isDowngrade(highestObj.version, candidate.version))
					highestObj = candidate;
			}
		
			highestObj.source_app_id = update.source_app_id;
			highestObj.app_name = update.app_name;
			highestObj.scope = update.scope;
			highestObj.vendor = update.vendor;
			highestObj.vendor_key = update.vendor_key;
			
			versions.push(highestObj);
		}

		return versions;		
	},
	
	_getHighestVersionNumber: /*{}*/ function(/*string*/ appId, /*[{}]*/ highestVersions) {
		for (var i = 0; i< highestVersions.length; i++) {
			var newestVersion = highestVersions[i];
			if (newestVersion.source_app_id == appId)
				return newestVersion.version;
		}
		gs.debug("No versions found for {1}", appId);
		return false;
	},
	
	_getManifestsSlowly: function() {
		//we'll let this happen async
		gs.eventQueue("sn_appclient.update.manifests","","","","");
	},
	
	_areEqual: /*Boolean*/ function(a, b) {
		if (gs.nil(a) && gs.nil(b))
			return true;
		
		return (a+'') == (b+'');
	},
	
	_areEqualBoolean: /*Boolean*/ function(a, b) {
		if (gs.nil(a) && gs.nil(b))
			return true;
		
		a = gs.nil(a) ? "false" : a+'';
		if (a == "true")
			a = "1";
		else if (a+'' == "false")
			a = "0";		

		b = gs.nil(b) ? "false" : b+'';
		if (b == "true")
			b = "1";
		else if (b == "false")
			b = "0";
		
		return a == b;
	},
	
    type: 'UpdateChecker'
};