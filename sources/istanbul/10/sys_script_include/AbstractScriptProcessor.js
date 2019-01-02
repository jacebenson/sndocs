var AbstractScriptProcessor = Class.create();

AbstractScriptProcessor.prototype = {
    SYSPARM_ACTION : 'sysparm_action',

    initialize : function(request, response, processor) {
        this.request = request;
        this.response = response;
        this.processor = processor;
        this.action = request.getParameter(this.SYSPARM_ACTION);
    },

    process : function() {},

    type: "AbstractScriptProcessor"
}