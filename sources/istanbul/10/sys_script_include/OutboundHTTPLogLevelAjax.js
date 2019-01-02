var OutboundHTTPLogLevelAjax = Class.create();
OutboundHTTPLogLevelAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	setLogLevel : function() {
		var outboundMessageType = this.getParameter('sysparm_outbound_message_type');
		var outboundMessageFn = this.getParameter('sysparm_outbound_message_fn');
		var logLevel = this.getParameter('sysparm_outbound_message_log_level');

		var gRecord = new GlideRecord('sys_outbound_http_log_level');
		gRecord.addQuery('outbound_message_type', outboundMessageType);
		gRecord.addQuery('outbound_message_function', outboundMessageFn);
		gRecord.query();

		if (gRecord.next()) {
			gRecord.setValue('log_level', logLevel);
			gRecord.update();
			return true;
		} else {
			gRecord = new GlideRecord('sys_outbound_http_log_level');
			gRecord.setValue('outbound_message_type', outboundMessageType);
			gRecord.setValue('outbound_message_function', outboundMessageFn);
			gRecord.setValue('log_level', logLevel);
			gRecord.insert();
			return true;
		}
		return false;
	},

	type: 'OutboundHTTPLogLevelAjax'
});