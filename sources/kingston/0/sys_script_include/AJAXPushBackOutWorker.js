var AJAXPushBackOutWorker = Class.create();
AJAXPushBackOutWorker.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	start: function() {
		var push_id = this.getParameter('sysparm_push_id');
		var progress_name = this.getParameter('sysparm_progress_name');
		var backout_type = this.getParameter('sysparm_backout_type');
		if (backout_type == 'update_set') {
			return this.backoutUpdateSet(push_id, progress_name);
		}

		var worker = new GlidePushBackOutWorker();
		worker.setProgressName(progress_name);
		worker.setPushId(push_id);		
		worker.setBackground(true);
		worker.start();
		gs.log("AJAXPluginManagerWorker: getProgressID = " + worker.getProgressID());
		
		return worker.getProgressID();

	},
	
	backoutUpdateSet: function(push_id, progress_name) {
		var backOutAPI = new SNC.BackOutAPI();
		var progressId = backOutAPI.processUpdateSetBackOut(push_id, progress_name);
		return progressId;
	},

    type: 'AJAXPushBackOutWorker'
});
	
	