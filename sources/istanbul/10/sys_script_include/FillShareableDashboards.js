var FillShareableDashboards = Class.create();
FillShareableDashboards.prototype = {
	initialize: function() {
	},
 
	fillChoice:function() {
		
		if (gs.hasRole('admin'))
			return "sys_idISNOTEMPTY";
		else if (gs.hasRole('pa_admin') || gs.hasRole('pa_power_user')) {
			var gp = [];
			var gr = new GlideRecord('pa_dashboards');
			gr.query();
			while(gr.next()) {
				if (gr.owner === gs.getUserID() || gr.canWrite())
					gp.push(gr.getUniqueValue());
			}
			return "sys_idIN" + gp.toString();
		}
 
		return "owner=" + gs.getUserID();
	},
	type: 'FillShareableDashboards'
};