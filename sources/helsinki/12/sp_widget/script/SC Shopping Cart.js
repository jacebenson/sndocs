(function() {
	var m = data.msgs = {};
	m.createdMsg = gs.getMessage("Created");
	m.trackMsg = gs.getMessage("track using 'Requests' in the header or");
	m.clickMsg = gs.getMessage("click here to view");
	var userID = gs.getUser().getID();
	var cart = new SPCart(input.cartName, userID);

	if (input && input.action === "edit_item") {
		data.editVariablesModal = $sp.getWidget('widget-modal', {embeddedWidgetId: 'sp-variable-editor', embeddedWidgetOptions: {sys_id: input.itemID, table: "sc_cart_item", isOrdering: true}});
		return;
	}

	if (input && input.action === "update_quantity") {
		var cartItemGR = new GlideRecord("sc_cart_item");
		if (cartItemGR.get(input.itemID)) {
			cartItemGR.setValue("quantity", input.quantity);
			cartItemGR.update();
		}
	}

	if (input && input.action === "checkout") {
		cart.setSpecialInstructions(input.additionalDetails);
		cart.setRequestedFor(input.cart.requested_for);
		cart.setDeliveryAddress(input.deliverTo);
		var request = cart.placeOrder();
		data.requestData = {
			number: request.getValue("number"),
			table: request.getTableName(),
			sys_id: request.getUniqueValue()
		}
		cart.setSpecialInstructions("");
		cart.setRequestedFor(userID);
		cart.setDeliveryAddress("");
	}

	if (input && input.action === "remove_item") {
		var itemGR = new GlideRecord('sc_cart_item');
		if (itemGR.get(input.removeItemID))
			itemGR.deleteRecord();
	}

	if (input && input.action === "save_cart") {
		var newCart = new SPCart(input.newCartName, userID);
		newCart.loadCart(cart.getCartID());
	}

	data.sys_properties = {
		twostep_checkout: gs.getProperty("glide.sc.checkout.twostep", "false") == 'true'
	};

	var cartID = cart.getCartID();
	data.saveCartModal = $sp.getWidget('widget-modal', {embeddedWidgetId: 'sc_save_bundle', embeddedWidgetOptions: {}});

	data.cart = cart.getCartObj();
	data.cartItems = cart.getItems();

})();