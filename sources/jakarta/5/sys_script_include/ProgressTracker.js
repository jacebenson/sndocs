var ProgressTracker = Class.create();
ProgressTracker.prototype = {

	initialize: function() {
	},
	
	getStatus: function(execId) {
		// gs.info("ProgressTracker: " + execId);
		var execution_id = execId;
		var pgr = new GlideRecord('sys_execution_tracker');
		pgr.get(execution_id);
		var status = this.getStatusLayer(pgr);
		return new global.JSON().encode(status);
	},

	getStatusLayer: function(gr) {
		// gs.info("getStatusLayer: " + gr.name.toString());
		var obj = {};
		obj.name = gr.name.toString();
		obj.state = gr.state.toString();
		obj.message = gr.message.toString();
		obj.sys_id = gr.sys_id.toString();
		obj.percent_complete = gr.percent_complete.toString();
		var updated_on = new GlideDateTime();
		updated_on.setDisplayValue(gr.sys_updated_on.getDisplayValue());
		obj.updated_on = updated_on.getNumericValue();

		obj.results = [];

		var pgr = new GlideRecord("sys_execution_tracker");
		pgr.addQuery("parent", gr.sys_id);
		pgr.addQuery("state",'1');
		pgr.orderBy("order");

		pgr.query();
		while (pgr.next()) {
			obj.results.push(this.getStatusLayer(pgr));
		}
		return obj;
	},

    type: 'ProgressTracker'
};