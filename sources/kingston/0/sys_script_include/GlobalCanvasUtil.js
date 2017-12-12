var GlobalCanvasUtil = Class.create();
GlobalCanvasUtil.prototype = {
	initialize: function() {
		// NoOp
	},

	getSessionProfile: function() {
		return new LiveFeedUtil().getSessionProfile();
	},

	getClientParameters: function(param) {
		var trans = GlideTransaction.get();
		if (trans) {
			var param_value = GlideTransaction.get().getRequestParameter(param);
			gs.info('Data from Glide transaction: ' + param_value);
			return param_value;
		}
		return '';
	},

	getDirection: function() {
		return GlideI18NStyle.getDirection();
	},

	checkpluginActive: function(plugin) {
		return pm.isActive(plugin);
	},
	
	refQualPaTabs: function() {
		var answer = '';
		if (gs.getProperty('glide.cms.enable.responsive_grid_layout', 'true') === 'true' && gs.getUserName() != 'admin') {
			return 'sys_created_by=' + gs.getUserName();
		} 
		return answer;
	},

    type: 'GlobalCanvasUtil'
};