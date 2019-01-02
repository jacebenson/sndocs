var AJAXProgressStatusChecker = Class.create();


AJAXProgressStatusChecker.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	
	getStatus: function() {
		var execution_id = this.getParameter('sysparm_execution_id');
		
		//gs.log("AJAXProgressStatusChecker:getStatus: execution_id = " + execution_id);
		
		var pgr = new GlideRecord('sys_execution_tracker');
		pgr.get(execution_id);
		
		var status = this.getStatusLayer(pgr);
		return new JSON().encode(status);
	},
	
	getStatusLayer: function(gr) {
		var obj = {};
		obj.name = gr.name.toString();
		obj.state = gr.state.toString();
		obj.message = gr.message.toString();
		obj.detail_message = gr.detail_message.toString();
		try {
			obj.result = new JSON().decode(gr.result.toString());
		} catch (e) {
			gs.print("Error occurred while parsing execution tracker result: " + e);
		}
		obj.sys_id = gr.sys_id.toString();
		obj.percent_complete = gr.percent_complete.toString();
		obj.updated_on = gr.sys_updated_on.toString();
		
		var startTime = new GlideDateTime(gr.start_time);
		var endTime = new GlideDateTime(gr.completion_time);
		var duration = new GlideDuration(endTime.getNumericValue() - startTime.getNumericValue());
		
        obj.duration = duration.getDisplayValue();
		
		obj.children = [];
		obj.results = [];
		var pgr = new GlideRecord("sys_execution_tracker");
		pgr.addQuery("parent", gr.sys_id);
		pgr.orderBy("order");
		pgr.query();
		while (pgr.next()) {
			obj.children.push(this.getStatusLayer(pgr));
		}
		return obj;
	},
	
	type : 'AJAXProgressStatusChecker'
	
});
