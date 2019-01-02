var LicenseDashboardHelper = Class.create();
LicenseDashboardHelper.prototype = {
	/*
	 LicenseType: Default: PER-USER
		 * PER-USER:0
		 * CAPACITY:1
	*/
	initialize: function() {
		this.SUBSCRIPTION_METRICS_REPORT_TAG = 'Subscription Metrics';
		this.SUBSCRIPTION_METRIC_Y_AXIS_LABEL = 'Count';
		this.REPORT_RENDERER = 'com.glide.ui.portal.RenderReport';
		this.SUBSCRIPTION_DASHBOARD_SYS_ID = 'b9a45fa2eb022100b8f326115206fe78';
		this.PER_USER = "0";
		this.CAPACITY = "1";
		this.licenseType = this.PER_USER;
		this.msg_source = "LicenseDashboardHelper";
		
	},
	
	addToSubscriptionDashboard: function(/*GlideRecord*/licGR, /*sys_id*/ purchased_count_cfg, /*sys_id*/ allocated_count_cfg, /*sys_id*/ non_subscribed_count_cfg) {
		
		
		if (!this._validateInput(licGR, purchased_count_cfg, allocated_count_cfg, non_subscribed_count_cfg))
			return;
		
		var licName = licGR.name;
		// Creates a report for this license
		// Create a guage which references the report and also add it to the subscription dashboard
		var report_id = this.createReportForLicense(licName, purchased_count_cfg, allocated_count_cfg, non_subscribed_count_cfg);
		if (!JSUtil.nil(report_id)) {
				// Add this Report to our OOB subscription dashbord
				// the sys_id of the dashboard = b9a45fa2eb022100b8f326115206fe78
				var new_dropzone_id = this.addPortalSection(this.SUBSCRIPTION_DASHBOARD_SYS_ID);
				
				if (!JSUtil.nil(new_dropzone_id)) {
					this.addPortalPref('renderer', this.REPORT_RENDERER, new_dropzone_id);
					this.addPortalPref('sys_id', report_id, new_dropzone_id);
					this.addPortalPref('title', licName + " Trend", new_dropzone_id);
				}
		} else 
			gs.log('Report creation for License:" + licName +  " failed, returning', this.msg_source);
	},
	
	_validateInput: function (licGR, purchased_count_cfg, allocated_count_cfg, non_subscribed_count_cfg) {
		if (JSUtil.nil(licGR)) {
			gs.log('Dashboard creation failed for subscription because license glide record is null');
			return false;
		}
		
		if (JSUtil.notNil(licGR.license_type)) 
			this.licenseType = licGR.license_type;
		
		this.isPerUserLicense = (this.licenseType == this.PER_USER);
		this.isQuotaLicense = (this.licenseType == this.CAPACITY);
		
		var invalidCfgs = JSUtil.nil(purchased_count_cfg) || JSUtil.nil(allocated_count_cfg);
		
		if (!invalidCfgs && this.isPerUserLicense)
			invalidCfgs = JSUtil.nil(non_subscribed_count_cfg);
		
		if (invalidCfgs) {
			
			var errMsg = 'Dashboard creation failed for subscription " + licGR.name +  " because license purchased or allocated' ;			
			if(this.isPerUserLicense)
				errMsg += "or non-subscribed users ";			
			errMsg +=  "count config provided is null";
			
			gs.log(errMsg, this.msg_source);
			return false;
		}
		
		return true;
	},
	
	createReportForLicense: function(licName, purchased_count_cfg, allocated_count_cfg, non_subscribed_count_cfg) {
		gs.log('Creating a new report for ' + licName);
		// Create a report
		var report = new GlideRecord('sys_report');
		report.title = licName + ' ' + this.SUBSCRIPTION_METRICS_REPORT_TAG;
		report.table = 'usageanalytics_count';		
		report.field = 'table_name'; // group by
		report.type = 'line'; // hbar looked really awful!
		report.sumfield = 'count';
		report.aggregate = 'AVG';
		report.trend_field = 'sys_created_on';
		report.interval = 'month';
		report.y_axis_title = this.SUBSCRIPTION_METRIC_Y_AXIS_LABEL;
		
		var filter = 'sys_created_on<javascript:gs.beginningOfThisMonth()^count_cfg=' + purchased_count_cfg + '^ORcount_cfg=' + allocated_count_cfg;
		if(this.isPerUserLicense)
			filter += '^ORcount_cfg=' + non_subscribed_count_cfg;		
		filter += '^EQ^GROUPBYtable_name^TRENDBYsys_created_on,month';
		
		report.filter = filter;		
		
		// restrict viewing to usage_admin role
		report.user = 'GLOBAL';
		report.roles = 'usage_admin';
		var rep_ID = report.insert();
		gs.print("Report SysID for License : " + licName + " - Title:" + report.title + " ====" +  rep_ID);
		return rep_ID;
	},
		
	addPortalSection: function (portal_page_id) {
		// figure out which dropzone and offset to use and add a new dropzone
		var portal_page = new GlideRecord('sys_portal');
		portal_page.addQuery('page', portal_page_id);
		portal_page.addEncodedQuery('dropzone=dropzone2^ORdropzone=dropzone1');
		portal_page.orderByDesc('offset');
		portal_page.orderByDesc('dropzone');
		portal_page.query();

		gs.log('Calculating the new dropzone and offset ');
		// Our subscription allocation dashboard is a standard 2 equal width column layout
		// Page with dropzones - dropzone0, dropzone1, dropzone2 and dropzone 999
		var offset_val;
		var dropzone_name;
		if (portal_page.next()) {
			var dropzone = portal_page.getValue('dropzone');
			if (dropzone == 'dropzone1') {
				offset_val =  portal_page.getValue('offset');
				dropzone_name = 'dropzone2';
			} else if (dropzone == 'dropzone2') {
				offset_val =  parseInt(portal_page.getValue('offset')) + 1;
				dropzone_name = 'dropzone1';
			}		
		} else {
			// No dropzone1 or dropzone 2 exists,
			// create dropzone1 with offset 0
			dropzone_name = 'dropzone1';
			offset_val = 0;
		}

		gs.log('Adding a new dropzone ' +dropzone_name+ ' to the subscription dashboard');
		gs.log('New dropzone offset is ' +offset_val);

		var new_dropzone_id;
		if (!JSUtil.nil(dropzone_name) && !JSUtil.nil(offset_val)) {

			var new_dropzone = new GlideRecord('sys_portal');
			new_dropzone.page = portal_page_id;
			new_dropzone.dropzone = dropzone_name;
			new_dropzone.offset = offset_val;
			new_dropzone_id = new_dropzone.insert();
			gs.log('Created a new dropzone with id ' +new_dropzone_id);
			return new_dropzone_id;
		} else {
			gs.log('Could not create a new dropzone because either the dropzone name or offset is nil', this.msg_source);
			return "";
		}	
	},
	
	addPortalPref: function (name, value, portal_section) {
		var portal_pref = new GlideRecord('sys_portal_preferences');
		portal_pref.name = name;
		portal_pref.portal_section = portal_section;
		portal_pref.value = value;
		portal_pref.insert();
	},
	
	type: 'LicenseDashboardHelper'
};