var OutboundHTTPMessageTables = Class.create();
OutboundHTTPMessageTables.prototype = {
    initialize: function() {
    },
	
	process: function() {
		return ['sys_rest_message_fn', 'sys_soap_message_function'];
	},

    type: 'OutboundHTTPMessageTables'
};