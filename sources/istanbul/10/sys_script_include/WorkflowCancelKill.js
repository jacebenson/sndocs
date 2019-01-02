var WorkflowCancelKill = Class.create();
WorkflowCancelKill.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	
	getTimeoutSecs: function() {
		var secs = gs.getProperty('glide.workflow.cancel.timeout', 5);
		return secs;
	},
	
    cancelContext: function() {
        var contextId = this.getParameter('sysparm_context');
		var gr = new GlideRecord('wf_context');
		gr.get(contextId);
		new Workflow().cancelContext(gr);
    },

	killContext: function() {
        var contextId = this.getParameter('sysparm_context');
		var gr = new GlideRecord('wf_context');
		gr.get(contextId);
		var wf = new Workflow();
		wf.cancel(gr);
		wf.broadcastKill(gr);
	},
	
	isContextExecuting: function() {
        var contextId = this.getParameter('sysparm_context');
		var gr = new GlideRecord('wf_context');
		gr.get(contextId);
		if ("executing" == gr.state || "paused" == gr.state) {
			return "true";
		}
		return "false";
	},
	
    type: 'WorkflowCancelKill'
});