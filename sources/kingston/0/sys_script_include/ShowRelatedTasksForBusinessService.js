var ShowRelatedTasksForBusinessService = Class.create();
ShowRelatedTasksForBusinessService.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	hasRelatedTaskCount : function() {
		var businessService = this.getParameter("sysparm_business_service");
		var sysId = this.getParameter("sysparm_sys_id");
		var gr = new GlideRecord("task");
		gr.addQuery("business_service", businessService);
		gr.addQuery("active", true);
		gr.addQuery("sys_id", "!=", sysId);
		gr.setLimit(1);
		gr.query();
		return gr.hasNext();
	},
});