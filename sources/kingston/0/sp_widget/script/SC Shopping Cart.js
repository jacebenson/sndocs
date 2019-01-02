(function() {
	var m = data.msgs = {};
	m.createdMsg = gs.getMessage("Created");
	m.trackMsg = gs.getMessage("track using 'Requests' in the header or");
	m.clickMsg = gs.getMessage("click here to view");
	m.cartEmptiedMsg = gs.getMessage("Your cart has been emptied");
	m.itemRemovedMsg = gs.getMessage("has been removed from your cart");
	m.updatedMsq = gs.getMessage("Updated");
	m.quantityToMsg = gs.getMessage("quantity to");
	m.removeItemConfirmationMsg = gs.getMessage("Are you sure you want to remove this item?");
	m.clearCartConfirmationMsg = gs.getMessage("Are you sure you want to empty your cart?");
	m.removeEditingItemMsg = gs.getMessage("Are you sure you want to remove the item you are viewing from your Cart?");
	var userID = gs.getUser().getID();
	var cartName = input && input.cartName ? input.cartName : '';
	var cartJS = new sn_sc.CartJS(cartName, '' + userID);

	data.sys_id = $sp.getParameter('sys_id');
	
	if (input && input.action === "checkout_two") {
		data.checkoutCartModal = $sp.getWidget('widget-modal', {embeddedWidgetId: 'sc-checkout', embeddedWidgetOptions: {cart: input.cart}, backdrop: 'static', keyboard: false, size: 'md'});
		return;
	}

	if (input && input.action === "update_quantity") {
		var cartItemGR = new GlideRecord("sc_cart_item");
		if (cartItemGR.get(input.itemID) && cartItemGR.canRead()) {
			cartItemGR.setValue("quantity", input.quantity);
			cartItemGR.update();
		}
	}

	if (input && input.action === "checkout") {
		var request = cartJS.checkoutCart(true);
		data.requestData = {
			number: request.request_number,
			table: 'sc_request',
			sys_id: request.request_id
		}
	}

	if (input && input.action === "remove_item") {
		cartJS.remove(input.removeItemID);
	}

	if (input && input.action === "clear_cart") {
		cartJS.empty(cartJS.getCartID());
	}

	if (input && input.action === "save_cart") {
		var newCart = new SPCart(input.newCartName, userID);
		newCart.setHidden(false);
		newCart.loadCart(cart.getCartID());
	}
	
	data.sys_properties = {
		twostep: gs.getProperty("glide.sc.sp.twostep", "true") == 'true'
	};

	data.cart = cartJS.getCartDetails(true);
	data.cartItems = [];
	data.cart.recurring_subtotals = {};
	for(var key in data.cart.cart_items)
		if(typeof data.cart.cart_items[key] === 'object') {
			data.cartItems = data.cartItems.concat(data.cart.cart_items[key].items);
			if(key != '')
				data.cart.recurring_subtotals[data.cart.cart_items[key].frequency_label] = data.cart.cart_items[key].subtotal_recurring_price;
		}
	data.cartItems = data.cartItems.map(function (item) {
		item.quantity = parseInt(item.quantity);
		return item;
	})
	data.disable_req_for = sn_sc.CartJS.canViewRF();

	data.saveCartModal = $sp.getWidget('widget-modal', {embeddedWidgetId: 'sc_save_bundle', embeddedWidgetOptions: {}});

})();