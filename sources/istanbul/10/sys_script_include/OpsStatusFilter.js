var OpsStatusFilter = Class.create();
OpsStatusFilter.prototype = {
	initialize: function(ciType) {
		this.ciType = ciType;
	},
	
	by: function (actionName) {
		var gr = new GlideRecord('statemgmt_not_allow_actions');
		gr.addQuery('ci_type', this.ciType);
		gr.addQuery('not_allowed_action.name', actionName);
		gr.query();
		var ops = [];
		while (gr.next()) {
			ops.push(gr.operational_state + '');
		}
		
		return ops;
	},
	
	type: 'OpsStatusFilter'
};