var LicenseCountConfig  = Class.create();
LicenseCountConfig .prototype = {
	
    initialize: function(name, license_type, id) {
		this.name = name;
		this.license_type = license_type;
		this.purchased = 'purchased';
		this.used = 'used';
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
			} else if (type == this.used) {
				if (this.countCfgExists(type)) {
					gs.log("Used count config entry for subscription " + this.name + " already exists.");
					return "";
				} else {
					gs.log("Creating a used count config entry for subscription " + this.name);
					return this.createCountCfgRecord(this.used);
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
			
			if (this.countCfgExists(this.used)) {
				var used_cfg = this.getCountCfgGR(this.used);
				used_cfg.query();
				used_cfg.next();
				used_cfg.deleteRecord();
				gs.log("Deleted the used count config entry for subscription " + this.name);
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
	
		if (type == this.purchased || type == this.used) {
			var gr = new GlideRecord('usageanalytics_count_cfg');
			gr.name = this.name + " " + type;
			gr.active = true;
			gr.count_type = 'Licensing';
			gr.description = "Get the count of " + this.name + " " + type + " monthly";
			gr.reportable = "false";
			gr.schedule = "Monthly";
			gr.script = this.getLicenseCountScript(type);
			return gr.insert();
		}
		
		return "";
	},	

	getLicenseCountScript: function(type) {
		
		var column;
		
		if (type == this.purchased)
			column = 'count';
		else
			column = 'allocated';
	
		return "answer = getCount();\n" +
				"function getCount() {\n" +
				"	var gr = new GlideRecord('license_details');\n" +
				"	gr.addQuery('end_date>javascript:gs.beginningOfLastMonth()^license_id=" + this.license_id + "');\n" +
				"	gr.query();\n" +
				"	if (gr.next())\n" +
				"		return parseInt(gr.getValue('" + column + "'));\n"+
				"	else\n" +
				"		return parseInt('0');\n" +
				"}";
		
	},

    type: 'LicenseCountConfig'
}