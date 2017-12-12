var LicenseCountConfig  = Class.create();
LicenseCountConfig .prototype = {
	
    initialize: function(name, license_type, id) {
		this.name = name;
		this.license_type = license_type;
		this.nonsubscribedusers = 'Non-subscribed Users';
		this.licensing = 'Licensing';
		this.license_id = id;
		this.msg_source = "LicenseCountConfig";
		
		this.PURCHASED = "purchased";
		this.ALLOCATED = "allocated";
		this.USAGEANALYTICS_COUNT_CFG = "usageanalytics_count_cfg";
		this.MONTHLY = "Monthly";
		this.DAILY = "Daily";	
		
    },
	
	createCountCfg: function(type) {
		
		var cntCfgSysID = "";
		var logMessage = "";
		
		var cfgGR = this.getCountCfgGR(type);
		
		
		if (!cfgGR.next()) {
			logMessage = "Creating a " + type  + " count config entry for subscription " + this.name;
			cntCfgSysID = this.createCountCfgRecord(type);
		} else {
			logMessage = type + " count config entry for subscription " + this.name + " already exists.";
			cntCfgSysID = cfgGR.getValue("sys_id");
		}
		
		if(JSUtil.notNil(logMessage))
			gs.log(logMessage, this.msg_source);
		
		return cntCfgSysID;
	},
	
	deleteCountCfg: function() {
		if (this.license_type == 0 || this.license_type == 1) {
			
			if (this.countCfgExists(this.PURCHASED))
				this._deleteConfigRecord(this.PURCHASED);
			
			if (this.countCfgExists(this.ALLOCATED))
				this._deleteConfigRecord(this.ALLOCATED);
			
			if (this.countCfgExists(this.nonsubscribedusers))
				this._deleteConfigRecord(this.nonsubscribedusers);
		}
	},
	
	_deleteConfigRecord: function(type) {
		var cfgGR = this.getCountCfgGR(type);
		cfgGR.query();
		cfgGR.next();
		cfgGR.deleteRecord();
		gs.log("Deleted the " + type + " count config entry for subscription " + this.name);
		
	},
		
	countCfgExists: function(type) {
		var count_cfg = this.getCountCfgGR(type);
		return count_cfg.hasNext();
	},
	
	getCountCfgGR: function(type) {
		// Return the GR object for count cfg by adding some base query conditions
		// does not do a gr.query()
		var count_cfg = new GlideRecord(this.USAGEANALYTICS_COUNT_CFG);
		count_cfg.addQuery("name", this.name + " " + type);
		count_cfg.addQuery("active", "true");
		count_cfg.addQuery('count_type', this.licensing);
		count_cfg.query();
		return count_cfg;
	
	},

	createCountCfgRecord: function(type) {
		
		if (type != this.PURCHASED && type != this.ALLOCATED && type != this.nonsubscribedusers)
			return "";
		
		var grTypeCfg = new GlideRecord(this.USAGEANALYTICS_COUNT_CFG);
			grTypeCfg.name = this.name + " " + type;
			grTypeCfg.active = true;
			grTypeCfg.count_type = this.licensing;
			grTypeCfg.description = this._getDescriptionForLicenseType(type);
			grTypeCfg.reportable = "false";
			grTypeCfg.schedule = this._getScheduleForLicenseType(type);
			grTypeCfg.script = this.getCountScriptForLicenseType(type);
			grTypeCfg.definition_id = this.getDefinitionId(type);
			grTypeCfg.exec_time_threshold = '500';
				
		return grTypeCfg.insert();
	
	},
		
	getDefinitionId: function(type) {
	
		if (type == this.PURCHASED)
			return 'LICPURCH' + this.license_id;
		else if (type == this.ALLOCATED)
			return 'LICALLOC' + this.license_id;
		else if (type == this.nonsubscribedusers)
			return 'LICUNALC' + this.license_id;
	},
	
	_getScheduleForLicenseType: function(type) {
		
		var schedule = this.MONTHLY;
		
		if (type == this.ALLOCATED)
			schedule = this.DAILY;
		return schedule;
		
	},
	
	_getDescriptionForLicenseType: function(type) {
		var description = "Get the count of " + this.name;
		
		if (type == this.PURCHASED)
			description += " purchased monthly";
		 else if (type == this.ALLOCATED) 
			description += " allocated daily";
		 else if (type == this.nonsubscribedusers)
			description += " non-subscribed users monthly";
		else
			description = "";
		
		return description;
	},
		
	getCountScriptForLicenseType: function(type) {

		if (type == this.PURCHASED)
			
			return "answer = getCount();\n" +
				"function getCount() {\n" +
				"	var gr = new GlideRecord('license_details');\n" +
				"	gr.addQuery('end_date>javascript:gs.beginningOfLastMonth()^license_id=" + this.license_id + "');\n" +
				"	gr.query();\n" +
				"	if (gr.next())\n" +
				"		return parseInt(gr.getValue('count'));\n"+
				"	else\n" +
				"		return parseInt('0');\n" +
				"}";
		
		else if (type == this.ALLOCATED)
			
				return "answer = getCount();\n" +
					"function getCount() {\n" +
					"	var gr = new GlideRecord('license_details');\n" +
					"	gr.addQuery('end_date>javascript:gs.beginningOfYesterday()^license_id=" + this.license_id + "');\n" +
					"	gr.query();\n" +
					"	if (gr.next())\n" +
					"		return parseInt(gr.getValue('allocated'));\n"+
					"	else\n" +
					"		return parseInt('0');\n" +
					"}";
		
		else if (type == this.nonsubscribedusers)
			
			return "var NO_ALLOCATION_STATUS = '3';\n" +
				"var UNALLOCATED_USER_STATUS = '4';\n\n" +
				"answer = getUnallocatedCount();\n\n" +
				"function getUnallocatedCount() {\n" +
				"    var apps = getApplicationsOfLicense();\n\n" +
				"    var gr = new GlideAggregate('ua_app_usage');\n" +
				"    gr.addAggregate('count(distinct', 'user');\n" +
				"    gr.addQuery('app_id', 'IN', apps);\n" +
				"    gr.addQuery('status', 'IN', NO_ALLOCATION_STATUS + ',' + UNALLOCATED_USER_STATUS);\n" +
				"    gr.addQuery('sys_created_onBETWEENjavascript:gs.beginningOfLastMonth()@javascript:gs.endOfLastMonth()');\n" +
				"    var gc = gr.addQuery('fulfill_count', '>', 0);\n" +
				"    gc.addOrCondition('produce_count', '>', 0);\n" +
				"    gr.setGroup(false);\n" +
				"    gr.query();\n\n" +
				"    if (gr.next()) {\n" +
				"        return gr.getAggregate('count(distinct', 'user');\n" +
				"    }\n" +
				"    return 0;\n" +
				"}\n\n" +
				"function getApplicationsOfLicense() {\n" +
				"    var apps = [];\n\n" +
				"    var licenseSysId = getLicenseSysId();\n" +
				"    if (GlideStringUtil.nil(licenseSysId)) {\n" +
				"        return apps;\n" +
				"    }\n\n" +
				"    var gr = new GlideRecord('license_has_app');\n" +
				"    gr.addQuery('license', licenseSysId);\n" +
				"    gr.query();\n\n" +
				"    while(gr.next()) {\n" +
				"        var appSysId = gr.getValue('app');\n" +
				"        var appGR = new GlideRecord('licensable_app');\n" +
				"        appGR.addQuery('sys_id', appSysId);\n" +
				"        appGR.query();\n\n" +
				"        if (appGR.next()) {\n" +
				"            apps.push(appGR.getValue('app_id'));\n" +
				"        }\n" +
				"    }\n\n" +
				"    return apps;\n" +
				"}\n\n" +
				"function getLicenseSysId() {\n" +
				"    var gr = new GlideRecord('license_details');\n" +
				"    gr.addQuery('license_id', '" + this.license_id + "');\n" +
				"    gr.query();\n\n" +
				"    if (gr.next()) {\n" +
				"        return gr.getValue('sys_id');\n" +
				"    }\n" +
				"    return '';\n" +
				"}";

	},

    type: 'LicenseCountConfig'
};