var LicenseCountConfig  = Class.create();
LicenseCountConfig .prototype = {
	
    initialize: function(name, license_type, id) {
		this.name = name;
		this.license_type = license_type;
		this.purchased = 'purchased';
		this.allocated = 'allocated';
		this.nonsubscribedusers = 'Non-subscribed Users';
		this.license_id = id;
    },
	
	createCountCfg: function(type) {
		if (this.license_type == 0) {
			// Per user license, create a count config entry to count the purchased and used monthly
			if (type == this.purchased) {
				if (this.countCfgExists(type)) {
					gs.log("Purchased count config entry for subscription " + this.name + " already exists.");
					return "";
				} else {
					gs.log("Creating a purchased count config entry for subscription " + this.name);
					return this.createCountCfgRecord(this.purchased);
				}	
			} else if (type == this.allocated) {
				if (this.countCfgExists(type)) {
					gs.log("Allocated count config entry for subscription " + this.name + " already exists.");
					return "";
				} else {
					gs.log("Creating an allocated count config entry for subscription " + this.name);
					return this.createCountCfgRecord(this.allocated);
				}	
			} else if (type == this.nonsubscribedusers) {
				if (this.countCfgExists(type)) {
					gs.log("Non-subscribed users count config entry for subscription " + this.name + " already exists.");
					return "";
				} else {
					gs.log("Creating an non-subscribed users count config entry for subscription " + this.name);
					return this.createCountCfgRecord(this.nonsubscribedusers);
				}	
			}	
		}	
	},
	
	deleteCountCfg: function() {
		if (this.license_type == 0) {
			if (this.countCfgExists(this.purchased)) {
				var purchased_cfg = this.getCountCfgGR(this.purchased);
				purchased_cfg.query();
				purchased_cfg.next();
				purchased_cfg.deleteRecord();
				gs.log("Deleted the purchased count config entry for subscription " + this.name);
			}
			
			if (this.countCfgExists(this.allocated)) {
				var allocated_cfg = this.getCountCfgGR(this.allocated);
				allocated_cfg.query();
				allocated_cfg.next();
				allocated_cfg.deleteRecord();
				gs.log("Deleted the allocated count config entry for subscription " + this.name);
			}
			
			if (this.countCfgExists(this.nonsubscribedusers)) {
				var nonsubscribedusers_cfg = this.getCountCfgGR(this.nonsubscribedusers);
				nonsubscribedusers_cfg.query();
				nonsubscribedusers_cfg.next();
				nonsubscribedusers_cfg.deleteRecord();
				gs.log("Deleted the non-subscribed users count config entry for subscription " + this.name);
			}
		}
	},
		
	countCfgExists: function(type) {
		var count_cfg = this.getCountCfgGR(type);
		count_cfg.query();
		return count_cfg.hasNext();
	},
	
	getCountCfgGR: function(type) {
		// Return the GR object for count cfg by adding some base query conditions
		// does not do a gr.query()
		var count_cfg = new GlideRecord('usageanalytics_count_cfg');
		count_cfg.addQuery('name', this.name + " " + type);
		count_cfg.addQuery('active', 'true');
		count_cfg.addQuery('count_type', 'Licensing');
		
		return count_cfg;
	
	},

	createCountCfgRecord: function(type) {
	
		if (type == this.purchased) {
			return this.createPurchaseCountCfgRecord();
		} else if (type == this.allocated) {
			return this.createAllocatedCountCfgRecord();
		} else if (type == this.nonsubscribedusers) {
			return this.createNonSubscribedUsersCountCfgRecord();
		}
		
		return "";
	},
	
	createPurchaseCountCfgRecord: function() {
		var gr = new GlideRecord('usageanalytics_count_cfg');
		gr.name = this.name + " " + this.purchased;
		gr.active = true;
		gr.count_type = 'Licensing';
		gr.description = "Get the count of " + this.name + " purchased monthly";
		gr.reportable = "false";
		gr.schedule = "Monthly";
		gr.script = this.getLicensePurchasedCountScript();
		gr.definition_id = this.getDefinitionId(this.purchased);
		return gr.insert();
	
	},
	
	createAllocatedCountCfgRecord: function() {
		var gr = new GlideRecord('usageanalytics_count_cfg');
		gr.name = this.name + " " + this.allocated;
		gr.active = true;
		gr.count_type = 'Licensing';
		gr.description = "Get the count of " + this.name + " allocated daily";
		gr.reportable = "false";
		gr.schedule = "Daily";
		gr.script = this.getLicenseAllocatedCountScript();
		gr.definition_id = this.getDefinitionId(this.allocated);
		return gr.insert();
	},
	
	createNonSubscribedUsersCountCfgRecord: function() {
		var gr = new GlideRecord('usageanalytics_count_cfg');
		gr.name = this.name + " " + this.nonsubscribedusers;
		gr.active = true;
		gr.count_type = 'Licensing';
		gr.description = "Get the count of " + this.name + " non-subscribed users monthly";
		gr.reportable = "false";
		gr.schedule = "Monthly";
		gr.script = this.getLicenseNonSubscribedUsersCountScript();
		gr.definition_id = this.getDefinitionId(this.nonsubscribedusers);
		return gr.insert();
	},
	
	getDefinitionId: function(type) {
	
		if (type == this.purchased)
			return 'LICPURCH' + this.license_id;
		else if (type == this.allocated)
			return 'LICALLOC' + this.license_id;
		else if (type == this.nonsubscribedusers)
			return 'LICUNALC' + this.license_id;
	},
	
	getLicensePurchasedCountScript: function() {
	
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
		
	},

	getLicenseAllocatedCountScript: function() {
	
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
		
	},
	
	getLicenseNonSubscribedUsersCountScript: function() {
	
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
}