function() {	
	var c = this;
	c.server.update();
	c.setService = function(serviceObj){
		jQuery('#select-service-label').text(serviceObj.name);
		c.data.service = serviceObj.sys_id;
		jQuery('#select-trigger-label').text('Trigger');
		c.server.update();
	};
	c.setTrigger = function(triggerObj){
		jQuery('#select-trigger-label').text(triggerObj.name);
		c.data.trigger = triggerObj.sys_id;
	};
}