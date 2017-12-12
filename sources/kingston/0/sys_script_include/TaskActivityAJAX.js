var TaskActivityAJAX = Class.create();
TaskActivityAJAX.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
	
	parseEmailTemplate: function () {
		var subject = this.getParameter('sysparm_subject');
		var message = this.getParameter('sysparm_message');
		var taskID = this.getParameter('sysparm_task');
		var taskTable = this.getParameter('sysparm_table');
		
		var task = new GlideRecord(taskTable);
		task.get(taskID);
		
		var parsed = new global.TaskActivityUtils().parseEmailTemplate(subject, message, task);
		
		var result = this.newItem("result");
		result.setAttribute("subject", parsed.subject);
		result.setAttribute("message", parsed.message);
	},

    type: 'TaskActivityAJAX'
});