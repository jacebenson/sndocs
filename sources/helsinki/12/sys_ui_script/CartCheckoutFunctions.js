var cartAjaxProcessor = 'CartAjaxProcessor';

function catDeliveryAddress(sysId, name) {
	var control = gel(name);
	if (!control)
		return;
	
	var ga = new GlideAjax(cartAjaxProcessor);
	ga.addParam('sysparm_action', 'set_delivery_address');
	ga.addParam('sysparm_value', control.value);
	ga.addParam('sysparm_sys_id', sysId);
	ga.getXMLAnswer(function(){}, null, null);
}

function catSpecialInstructions(sysId, name) {
	var control = gel(name);
	if (!control)
		return;
	
	var ga = new GlideAjax(cartAjaxProcessor);
	ga.addParam('sysparm_action', 'set_special_instructions');
	ga.addParam('sysparm_value', control.value);
	ga.addParam('sysparm_sys_id', sysId);
	ga.getXMLAnswer(function(){}, null, null);
}

function catReqFor(name) {
	var control = gel(name);
	if (!control)
		return;
	
	var ga = new GlideAjax(cartAjaxProcessor);
	ga.addParam('sysparm_action', 'req_for');
	ga.addParam('sysparm_value', control.value);
	serverRequest(ga.getURL());
}