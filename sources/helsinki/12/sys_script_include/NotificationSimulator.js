var NotificationSimulator = Class.create();
NotificationSimulator.prototype = Object.extendsObject(AbstractAjaxProcessor,  {
	ajaxFunction_simulate: function() {
		
		var result = SNC.NotificationSimulator.simulate(this.getParameter("sysparm_email_action_id"), this.getParameter("sysparm_record_id"), this.getParameter("sysparm_user_id"), this.getParameter("sysparm_event_id"), this.getParameter("sysparm_changed_fields"));
		var json = new JSON();
		return json.encode(result);
	},
	type: 'NotificationSimulator'
});