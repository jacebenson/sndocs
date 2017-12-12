var hr_coe_config = Class.create();
hr_coe_config.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
	getAllCoes: function() {
		var activeCoe = [];
		var HR_CORE = 'sn_hr_core';

		if (!gs.hasRole('sn_hr_core.admin'))
			return new global.JSON().encode(activeCoe);

		var enq = "id!=hr_lifecycle_events^ORid=NULL^id!=hr_case^ORid=NULL^app_id=com.sn_hr_core";
		var coeGr = new GlideRecord('ua_entitlement');
		coeGr.addEncodedQuery(enq);
		coeGr.query();
		while (coeGr.next()) {
			var obj = {};
			obj.value = coeGr.getValue('id');
			obj.name = coeGr.getValue('name');
			obj.selected = (coeGr.active == true);
			if (gs.getProperty("sn_hr_core.hr_enforce_license", "false") == "true")
				obj.enabled = sn_lef.GlideEntitlement.entitlementExists(coeGr.getValue('id')) || (coeGr.user_override == true);
			else
				obj.enabled = true;

			activeCoe.push(obj);
		}

		return new global.JSON().encode(activeCoe);
	},
	
	saveCOEConfig: function() {
		try {
			if (!gs.hasRole('sn_hr_core.admin'))
				return "error";
			var deactive_Coe = JSON.parse(this.getParameter('sysparm_deactive_coe'));
			var active_Coe = JSON.parse(this.getParameter('sysparm_active_coe'));
			return new hr_license().configureCOE(active_Coe, deactive_Coe);
		} catch(err) {
			return "error" + err;
		}
	},
	
	type: 'hr_coe_config'
});