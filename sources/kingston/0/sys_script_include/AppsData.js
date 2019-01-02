var AppsData = Class.create();
AppsData.prototype = {
	
	CANNOT_READ_MESSAGE : "Insufficient privileges to read records from table {0}",
		
	initialize: function() {
		new UpdateChecker().checkAvailableUpdates();
		this.versionComparator = new VersionComparator();		
	},
	
	getAllApps: function(app_sys_id){
		var apps = [];
		this._addNewApps(apps);
		this._addInstalledApps(apps);
		var custom = [];
		this._addCustomApps(custom);
		return {
			data: apps,
			custom: custom
		};
	},
	
	getAllAppsWithVersions: function(app_sys_id){
		var apps = [];
		this._addNewApps(apps);
		this._addInstalledApps(apps);
		var custom = [];
		this._addCustomApps(custom);
		this._addVersionsToApps(apps, custom);
		return {
			data: apps,
			custom: custom,
			appServer: gs.getProperty("sn_appclient.store_base_url", "http://localhost:8080/")
		};
	},
	
	_addNewApps: function(/*[]*/ apps) {
		var appDetails = new GlideRecord('sys_remote_app');
		if(appDetails.canRead()) {
			appDetails.orderByDesc('sys_created_on');
			appDetails.query();
			gs.debug("Including {0} new apps from {1}:{2}",
			appDetails.getRowCount(),
			appDetails.getRecordClassName(),
			appDetails.getEncodedQuery());
			while(appDetails.next()) {
				apps.push(this._getAppDetails(appDetails));
			}
		} else {
			gs.info(gs.getMessage(this.CANNOT_READ_MESSAGE, 'sys_remote_app'));
		}
		
		// Assumes no store app is ever deleted from the store
		appDetails = new GlideRecord('sys_store_app');
		if(appDetails.canRead()) {
			appDetails.addNullQuery('version');
			appDetails.orderByDesc('sys_created_on');
			appDetails.query();
			gs.debug("Including {0} new (inactive and not yet installed) apps from {1}:{2}",
			appDetails.getRowCount(),
			appDetails.getRecordClassName(),
			appDetails.getEncodedQuery());
			while(appDetails.next()) {
				apps.push(this._getAppDetails(appDetails));
			}
		} else {
			gs.info(gs.getMessage(this.CANNOT_READ_MESSAGE, 'sys_store_app'));
		}
	},
	
	_addInstalledApps: function(/*[]*/ apps) {
		var appDetails = new GlideRecord('sys_store_app');
		if(appDetails.canRead()) {
			appDetails.addNotNullQuery('version');
			appDetails.orderByDesc('update_date');
			appDetails.query();
			gs.debug("Including {0} installed apps from {1}:{2}",
			appDetails.getRowCount(),
			appDetails.getRecordClassName(),
			appDetails.getEncodedQuery());
			while(appDetails.next()) {
				apps.push(this._getAppDetails(appDetails));
			}
		} else {
			gs.info(gs.getMessage(this.CANNOT_READ_MESSAGE, 'sys_store_app'));
		}
	},
	
	_addCustomApps: function(/*[]*/ custom) {
		var customApps = new GlideRecord('sys_app');
		if(customApps.isValid() && customApps.canRead()) {
			customApps.orderByDesc('sys_created_on');
			customApps.query();
			while(customApps.next()) {
				custom.push(this._getAppDetails(customApps));
			}
		} else {
			gs.info(gs.getMessage(this.CANNOT_READ_MESSAGE, 'sys_app'));
		}
	},

	_addVersionsToApps: function(/*array*/ apps,/*array*/ custom) {
		var i;
		for(i=0; i<apps.length; i++) {
			app = apps[i];
			this._addAppVersions(app);
		}

		for(i=0; i<custom.length; i++) {
			app = custom[i];
			this._addAppVersions(app);
		}

	},

	_addAppVersions: function(/*{app}*/ app) {
		app.versions = [];
		var versions = new GlideRecord("sys_app_version");
		versions.addQuery("source_app_id", app.sys_id);


		versions.query();

		while(versions.next()) {

			var parsedManifest = JSON.parse(versions.getValue("manifest"));
			//only give us *other* installable versions
			if(app.version && app.version == versions.getValue("version")) {
				app.manifest = parsedManifest;
				continue;
			} else if (app.latest_version && app.latest_version == versions.getValue("version")) {
				app.manifest = parsedManifest;
				continue;
			}

			//remember app is *NOT* a GlideRecord
			if (!this.versionComparator.isUpgrade(app.version, versions.getValue("version")))
				continue;

			var tempObj = {};
			tempObj.auto_update = versions.getValue("auto_update");
			tempObj.demo_data = versions.getValue("demo_data") == "has_demo_data" ? true : false;
			tempObj.dependencies = versions.getValue("dependencies");
			tempObj.name = versions.getValue("name");
			tempObj.number = versions.getValue("number");
			tempObj.publish_date = versions.getValue("publish_date");
			tempObj.display_date = versions.getValue("publish_date");
			tempObj.release_notes = versions.getValue("release_notes");
			tempObj.remote_application = versions.getValue("remote_application");
			tempObj.scope = versions.getValue("scope");
			tempObj.short_description = versions.getValue("short_description");
			tempObj.source_app_id = versions.getValue("source_app_id");
			tempObj.sys_id = versions.getValue("sys_id");
			tempObj.title = versions.getValue("title");
			tempObj.vendor = versions.getValue("vendor");
			tempObj.vendor_key = versions.getValue("vendor_key");
			tempObj.version = versions.getValue("version");
			tempObj.manifest = parsedManifest;

			//add a pretty display date for publish_date
			if (tempObj.publish_date) {
				var displayDate = new GlideClientDate();
				displayDate.setValue(tempObj.publish_date.toString());
				tempObj.display_date = displayDate.getDisplayValue();
			}

			app.versions.push(tempObj);
		}

		var that = this;
		app.versions.sort(function(a, b) {
			if (that.versionComparator.isDowngrade(a.version, b.version))
				return 1;

			if (that.versionComparator.isUpgrade(a.version, b.version))
				return -1;

			if (that.versionComparator.isEqual(a.version, b.version))
				return 0;
		});


		for (var i=0; i<app.versions.length; i++) {
			app.versions[i].sortable_version = i + 1;
		}

	},

	_getAppDetails: function(/*GlideRecord sys_remote_app | sys_store_app*/ appDetails) {
		var tempobj = {};

		var logoid = new GlideRecord('sys_attachment');
		logoid.addQuery('table_sys_id', appDetails.sys_id.toString());
		logoid.addQuery('file_name', 'logo');
		logoid.query();
		if (logoid.next())
			tempobj.logo = logoid.sys_id.toString() + ".iix";

		tempobj.short_description=appDetails.short_description.toString();
		tempobj.key_features=appDetails.isValidField('key_features')
		? appDetails.key_features.toString()
		: '';
		tempobj.release_notes=appDetails.isValidField('release_notes')
		? appDetails.release_notes.toString()
		: '';
		tempobj.name=appDetails.name.toString();
		tempobj.vendor=appDetails.vendor.toString();
		tempobj.vendor_prefix=appDetails.vendor_prefix.toString();
		tempobj.link=this._checkAppIsProperlyInstalled(appDetails) ? appDetails.getLink(true) : null; //Link to the app should be given only when app is propertly installed.
		tempobj.scope=appDetails.scope.toString();
		tempobj.active=appDetails.isValidField('active') ? appDetails.active.toString() == 'true' : false;

		var install_date = null;
		if (appDetails.isValidField('install_date') && !appDetails.install_date.nil()) {
			install_date = new GlideDate();
			install_date.setValue(appDetails.install_date);
		} else if (appDetails.isValidField('version') && !gs.nil(appDetails.version)) {
			install_date = new GlideDate();
			install_date.setValue(appDetails.sys_created_on);
		}

		var update_date = '';
		tempobj.recent_updated = false;
		if (appDetails.isValidField('update_date') && !appDetails.update_date.nil()) {
			update_date = new GlideDate();
			update_date.setValue(appDetails.update_date);
			var thirty_days_ago = new GlideDate();
			thirty_days_ago.setValue(gs.daysAgoStart(30));
			tempobj.has_updated = update_date.compareTo(install_date) > 0;
			tempobj.recent_updated = tempobj.has_updated && update_date.compareTo(thirty_days_ago) >= 0;
		}

		tempobj.install_date=gs.nil(install_date) ? '' : install_date.getDisplayValue();
		tempobj.update_date=gs.nil(update_date) ? '' : update_date.getDisplayValue();

		if ('sys_remote_app' == appDetails.getRecordClassName()) {
			tempobj.version="";
			tempobj.assigned_version="";
			if (!gs.nil(appDetails.latest_version)) {
				tempobj.latest_version=appDetails.latest_version.toString();
				tempobj.latest_version_display = this._getMajorAndMinorDisplayVersion(appDetails.latest_version.toString());
			} else {
				tempobj.latest_version=tempobj.version;
			}
		} else {
			if(!gs.nil(appDetails.version)) {
				tempobj.version=appDetails.version.toString();
				tempobj.version_display=this._getMajorAndMinorDisplayVersion(appDetails.version.toString());
			} else
				tempobj.version="";

			if (appDetails.isValidField('assigned_version') && !gs.nil(appDetails.assigned_version))
				tempobj.assigned_version=appDetails.assigned_version;
			else
				tempobj.assigned_version=tempobj.version;

			if (appDetails.isValidField('latest_version') && !gs.nil(appDetails.latest_version)) {
				gs.debug("App: {0} Latest version: {1} Version: {2} ", appDetails.name.toString(), appDetails.latest_version.toString(), appDetails.version.toString());
				tempobj.latest_version=appDetails.latest_version.toString();
				tempobj.latest_version_display=this._getMajorAndMinorDisplayVersion(appDetails.latest_version.toString());
				// if the versions are in fact different, the UI must show a difference
				if (tempobj.version != tempobj.latest_version && tempobj.version_display == tempobj.latest_version_display)
					 tempobj.latest_version_display = tempobj.latest_version;
				
				gs.debug("tempobj is {0}", new global.JSON().encode(tempobj));
			} else {
				tempobj.latest_version=tempobj.version;
				tempobj.latest_version_display=tempobj.version_display;
				gs.debug("App: {0} Set latest version to {1} and display to {2} ", appDetails.name, tempobj.version, tempobj.version_display);

			}
		}

		tempobj.demo_data = appDetails.isValidField('demo_data')
		? appDetails.demo_data.toString()
		: '';
		tempobj.sys_id=appDetails.sys_id.toString();
		tempobj.sys_updated_on=appDetails.sys_updated_on.toString();
		tempobj.sys_created_on=appDetails.sys_created_on.toString();

		var createdOn = new GlideDate();
		createdOn.setValue(appDetails.sys_created_on.toString());
		tempobj.sys_created_on_display=createdOn.getDisplayValue();

		var displayDate;
		if('sys_store_app' == appDetails.getRecordClassName()) {
			if(!appDetails.update_date.nil()) {
				displayDate = new GlideClientDate();
				displayDate.setValue(appDetails.update_date.toString());
				tempobj.display_date = displayDate.getDisplayValue();
			}
		} else {
			displayDate = new GlideClientDate();
			var publishDate = appDetails.isValidField('publish_date')
							&& !appDetails.publish_date.nil() ? appDetails.publish_date.toString() : appDetails.sys_updated_on.toString();
			displayDate.setValue(publishDate);
			tempobj.display_date = displayDate.getDisplayValue();
		}

		//now add manifest

		gs.debug("Including " + appDetails.getRecordClassName() + ": " + new global.JSON().encode(tempobj));
		return tempobj;
	},

	_getMajorAndMinorDisplayVersion: function(val) {
		var ary = val.toString().split('.');
		if (ary.length <= 1)
			return val;

		if (ary[ary.length - 1].length >= 12)
			return val;

		if (ary.length >= 2 && ary[0] === 0 && ary[1] === 0)
			return val;

		while(ary[ary.length - 1] == 0)
			ary.pop();

		return ary.join('.');
	},

	_checkAppIsProperlyInstalled: function(appDetails) {
		var tableName = appDetails.getTableName();
		if (tableName == 'sys_remote_app')
			return false;
		else if (tableName == 'sys_store_app') { // if app is aborted then also app is not properly installed so return false.
			if (appDetails.getValue('active') == '0') {
				var ga = new GlideAggregate('sys_metadata');
				ga.addQuery('sys_scope', appDetails.sys_id);
				ga.setGroup(false);
				ga.query();
				return ga.hasNext();
			}
		}
		return true;
	},

	type: 'AppsData'
};