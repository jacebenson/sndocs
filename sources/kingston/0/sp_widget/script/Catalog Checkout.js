(function() {
	data.action = options.action;
	if (data.action)
		data.item = options.item;
	else
		data.action = 'checkout';
	
	var cartName = '';
	if (input)
		cartName = input.cart.name;
	else if (options.cart)
		cartName = options.cart.name;
		
	var m = data.msgs = {};
	m.dialogTitle = gs.getMessage("Delete Attachment");
	m.dialogMessage = gs.getMessage("Are you sure?");
	m.dialogOK = gs.getMessage("OK");
	m.dialogCancel = gs.getMessage("Cancel");
	m.renameSuccessMsg = gs.getMessage("Attachment renamed successfully");
	m.deleteSuccessMsg = gs.getMessage("Attachment deleted successfully");
	
	data.maxAttachmentSize = parseInt(gs.getProperty("com.glide.attachment.max_size", 1024));
	if (isNaN(data.maxAttachmentSize))
		data.maxAttachmentSize = 24;
	m.largeAttachmentMsg = gs.getMessage("Attached files must be smaller than {0} - please try again", "" + data.maxAttachmentSize + "MB");
	
	var cartJS;
	if (data.action !== 'order_now') {
		cartJS = new sn_sc.CartJS(cartName, '' + gs.getUser().getID());
		
		if (input && input.action === "change_shipping_info") {
			cartJS.setSpecialInstructions(input.special_instructions);
			cartJS.setRequestedFor(input.requestedFor);
			cartJS.setDeliveryAddress(input.deliverTo);
		}
	}
	
	if (input && input.action == 'order_guide') {
		var guideJS = new sn_sc.OrderGuide('' + cartName);
		var cartJS = new sn_sc.CartJS('' + cartName);
		for(var i = 0; i < input.item.length; i++)
			guideJS.navigateFromMap(input.item[i]);
		cartJS.activateGuide();
		cartJS.setDeliveryAddress(input.delivery_address);
		cartJS.setSpecialInstructions(input.special_instructions);
		cartJS.setRequestedFor(input.requested_for);
		var request = cartJS.checkoutGuide();
		data.result = {sys_id: request.request_id, number: request.request_number, table: 'sc_request'};
		$sp.logStat('Checkout Request', 'sc_request', request.request_id);
		return;
	}
	
	if (input && input.action === 'checkout') {
		var request = cartJS.checkoutCart(true);
		data.result = {sys_id: request.request_id, number: request.request_number, table: 'sc_request'};
		$sp.logStat('Checkout Request', 'sc_request', request.request_id);
		return;
	}

	if (data.action !== 'order_now')
		data.cart = cartJS.getCartDetails(false);
	else
		data.cart = {name: cartName, sys_id: gs.generateGUID(), requested_for: gs.getUser().getID(), requested_for_display_name: gs.getUser().getDisplayName(), delivery_address: sn_sc.CartJS.getRequestedForAddress(gs.getUser().getID())};

	if (options && options.requested_for && options.requested_for.id) {
			data.cart.requested_for = options.requested_for.id;
			data.cart.requested_for_display_name = options.requested_for.displayValue;
	}
	data.disable_req_for = sn_sc.CartJS.canViewRF();
	var reqForDispCols = gs.getProperty("glide.sc.request_for.columns");
	if (reqForDispCols && reqForDispCols.length > 0) {
		 reqForDispCols = reqForDispCols.replace(/;/g, ",")
	}
	data.reqForDispCols = reqForDispCols || "name";
	data.reqForQuery = gs.getProperty("glide.sc.request_for.query");
	
})();