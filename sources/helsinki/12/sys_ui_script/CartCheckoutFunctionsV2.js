var cartAjaxProcessor = 'CartAjaxProcessorV2';

function storeCartDeliveryAddress(sysId, name, action, cartName) {
	var control = gel(name);
	if (!control || !action)
		return;
	
	var ga = new GlideAjax(cartAjaxProcessor);
	ga.addParam('sysparm_action', action);
	ga.addParam('sysparm_value', control.value);
	ga.addParam('sysparm_sys_id', sysId);
	ga.addParam('sysparm_cart_name', cartName);
	ga.getXMLAnswer(function(){}, null, null);
}

function catSpecialInstructions(sysId, name, cartName) {
	var control = gel(name);
	if (!control)
		return;
	
	var ga = new GlideAjax(cartAjaxProcessor);
	ga.addParam('sysparm_action', 'set_special_instructions');
	ga.addParam('sysparm_value', control.value);
	ga.addParam('sysparm_sys_id', sysId);
	ga.addParam('sysparm_cart_name', cartName);
	ga.getXMLAnswer(function(){}, null, null);
}

function catReqFor(name, target, cartName) {
	var control = gel(name);
	if (!control)
		return;
	
	var ga = new GlideAjax(cartAjaxProcessor);
	ga.addParam('sysparm_action', 'req_for');
	ga.addParam('sysparm_value', control.value);
	ga.addParam('sysparm_cart_name', cartName);
	ga.getXML(function(response){
		if (response && response.responseXML && $(target)) {
			responseJSON = response.responseXML.getElementsByTagName('item')[0].getAttribute('delivery_address').evalJSON();
			var address = responseJSON.delivery_address.trim();
			$(target).title = address;
			$(target).value = address;
		}
	}, null, null);
}