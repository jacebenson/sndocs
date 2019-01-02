var SecurityEventSender = Class.create();

SecurityEventSender.prototype = Object.extendsObject(AbstractAjaxProcessor, {
  process: function() {
	    var eventName = this.getParameter('sysparm_eventName');
	    var parm1 = this.getParameter('sysparm_parm1');
	    var parm2 = this.getParameter('sysparm_parm2');
		SNC.SecurityEventSender.sendEventData(eventName, parm1, parm2);	
	},
	
	type: "SecurityEventSender"
});