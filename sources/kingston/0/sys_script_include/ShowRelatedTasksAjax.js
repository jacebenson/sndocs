var ShowRelatedTasksAjax = Class.create();

ShowRelatedTasksAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	getRelatedTaskCount : function() {
		var ci = this.getParameter("sysparm_ci");
		var task = this.getParameter("sysparm_task");
		var gr = new GlideRecord("task_ci");
		gr.addQuery("ci_item", ci);
		gr.addQuery("task.active", true);
		gr.addQuery("task", "!=", task);
		gr.setLimit(1);
		gr.query();
		return gr.getRowCount();
	},
});
