var ExecutionTrackerIDAjax = Class.create();
ExecutionTrackerIDAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	process: function() {
	    var sourceId = this.getParameter('sysparm_ajax_processor_source_id');
		var sourceTable = this.getParameter('sysparm_ajax_processor_source_table');

		if (!gs.nil(sourceId) && !gs.nil(sourceTable))
			return this._getLatestTracker(sourceId, sourceTable);
	},
	
	_getLatestTracker: function(sourceId, sourceTable) {
		var gr = new GlideRecord('sys_execution_tracker');
		gr.addQuery("source", sourceId);
		gr.addQuery("source_table", sourceTable);
		gr.orderByDesc("sys_created_on");
		gr.setLimit(1);
		gr.query();
		if (!gr.next()) {
			return;
		}
		
		return gr.sys_id;
	},

    type: 'ExecutionTrackerIDAjax'
});