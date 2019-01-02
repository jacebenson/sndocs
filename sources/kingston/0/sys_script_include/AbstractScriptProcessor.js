var AbstractScriptProcessor = Class.create();

AbstractScriptProcessor.prototype = {
    SYSPARM_ACTION : 'sysparm_action',

    initialize : function(request, response, processor) {
        this.request = request;
        this.response = response;
        this.processor = processor;
        this.action = request.getParameter(this.SYSPARM_ACTION);

		response.setHeader("Pragma", "no-store,no-cache"); // HTTP 1.0
		response.setHeader("Cache-control", "no-cache,no-store,must-revalidate,max-age=-1"); // HTTP 1.1
		response.setHeader("Expires", "0"); // prevents cache
    },

    process : function() {},

    type: "AbstractScriptProcessor"
};