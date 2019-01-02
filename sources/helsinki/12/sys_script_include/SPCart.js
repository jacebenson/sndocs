var SPCart = Class.create();

// Static methods
SPCart.updateItem = function(itemID, vars) {
	var scCartItemGR = new GlideRecord("sc_cart_item");
	if (!scCartItemGR.get(itemID))
		return false;

	var scItemOptionGR;
	var variable;
	for (var i = 0; i < vars.length; i++) {
		variable = vars[i];
		scItemOptionGR = new GlideRecord("sc_item_option");
		scItemOptionGR.addQuery("cart_item", itemID);
		scItemOptionGR.addQuery("item_option_new.name", variable.variable_name);
		scItemOptionGR.query();

		if (scItemOptionGR.next()) {
			scItemOptionGR.setValue("value", variable.value);
			scItemOptionGR.update();
		}
	}
};

//Instance methods
SPCart.prototype = Object.create(Cart.prototype);

SPCart.prototype.initialize = function(cartName, userID) {
	this.cartName = !cartName ? null : cartName;
	this.userID = !userID ? null : userID;

	this.cart = this.getCart();
};

SPCart.prototype.getCartID = function() {
	return this.cart.sys_id;
};

SPCart.prototype.getCartObj = function() {
	var cart = GlideappCart.getCartForRhino(this.cartName, this.userID);
	var formatter = new SPCurrencyFormatter();
	return {
		requested_for: cart.getRequestedFor(),
		requested_for_display_name: cart.getRequestedForDisplayName(),
		user: cart.getCartRecord.getValue("user"),
		name: this.cartName,
		subtotal: this.getSubtotal(),
		display_subtotal: formatter.trim(this.getSubtotal()),
		recurring_subtotals: this.getRecurringSubtotals()
	};
};

SPCart.prototype.getSubtotal = function() {
	return this.getItems().map(function(item) {
		return item.subtotal;
	}).reduce(function(prevValue, currValue) {
		return prevValue + currValue;
	}, 0.0);
};

SPCart.prototype.getRecurringSubtotals = function() {
	var recurringSubtotalArr = {};
	this.getItems().filter(function(item){
		return item.recurring_price && item.recurring_price > 0;
	}).map(function(item) {
		return {
			period: item.recurring_frequency_display,
			subtotal: item.recurring_subtotal
		};
	}).forEach(function(item) {
		if (!recurringSubtotalArr[item.period])
			recurringSubtotalArr[item.period] = item.subtotal;
		else
			recurringSubtotalArr[item.period] += item.subtotal;
	});

	var formatter = new SPCurrencyFormatter();

	for (var key in recurringSubtotalArr) {
		recurringSubtotalArr[key] = formatter.trim(recurringSubtotalArr[key]);
	}

	return recurringSubtotalArr;
};

SPCart.prototype.getItems = function() {
	var items = [];
	var cartItemGR = new GlideRecord("sc_cart_item");
	cartItemGR.addQuery("cart", this.cart.getUniqueValue());
	cartItemGR.query();

	while(cartItemGR.next()) {
		items.push(this.getItem(cartItemGR.getUniqueValue()));
	}

	return items;
};

SPCart.prototype.setDeliveryAddress = function(deliveryAddress) {
	var cart = GlideappCart.getCartForRhino(this.cartName, this.userID);
	cart.setDeliveryAddress(deliveryAddress);
};

SPCart.prototype.setSpecialInstructions = function(specialInstructions) {
	var cart = GlideappCart.getCartForRhino(this.cartName, this.userID);
	cart.setSpecialInstructions(specialInstructions);
};

SPCart.prototype.setRequestedFor = function(requestedFor) {
	var cart = GlideappCart.getCartForRhino(this.cartName, this.userID);
	var cartGR = cart.getGlideRecord();
	cartGR.setValue("requested_for", requestedFor);
	cartGR.update();
};

SPCart.prototype.getItem = function(cartItemID) {
	function showQuantity() {
		var roles = gs.getProperty('glide.sc.allow.quantity');
		var showItemQuantityByRole = true;
		if (roles == null || roles == '')
			;
		else {
			var hasRole = gs.hasRole(roles);
			if (hasRole == false)
				showItemQuantityByRole = false;
		}

		var itemHidesQuantity = cartItem.getGr().cat_item.no_quantity;
		return showItemQuantityByRole && !itemHidesQuantity && cartItem.getShowQuantity();
	}

	var optionCount = 0;
	var optionGR = new GlideRecord("sc_item_option");
	optionGR.addQuery("cart_item", cartItemID);
	optionGR.query();
	optionCount = optionGR.getRowCount();

	var cartItem = GlideappCartItem.get(cartItemID);
	return {
		name: cartItem.getDisplayName(),
		price: cartItem.getPrice(),
		display_price: cartItem.getDisplayPrice(),
		has_options: optionCount > 0,
		recurring_price: cartItem.getRecurringPrice(),
		display_recurring_price: cartItem.getRecurringDisplayPrice(),
		quantity: cartItem.getQuantity(),
		show_quantity: showQuantity(),
		subtotal: cartItem.getSubtotal(),
		subtotal_price: cartItem.getSubtotalPrice(),
		subtotal_price_with_currency: cartItem.getSubtotalWithCurrency(),
		recurring_subtotal: cartItem.getRecurringSubtotal(),
		recurring_subtotal_price: cartItem.getRecurringSubtotalPrice(),
		recurring_subtotal_price_with_currency: cartItem.getRecurringSubtotalWithCurrency(),
		recurring_frequency_display: cartItem.getGr().cat_item.recurring_frequency.getDisplayValue(),
		short_description: cartItem.getGr().cat_item.short_description.getDisplayValue(),
		picture: cartItem.getGr().cat_item.picture.getDisplayValue(),
		item_id: cartItem.getGr().getValue("cat_item"),
		sys_id: cartItemID
	};
};

//Copy the contents of a given cart into this one.
//Optionally, provide an array of cart item sys_ids to copy. Anything not included is ignored.
//Or, leave undefined to copy every item.
SPCart.prototype.loadCart = function(loadFromCartID, includedItemsArr) {
	var cartItemGR = new GlideRecord("sc_cart_item");
	cartItemGR.addQuery("cart", loadFromCartID);
	if(includedItemsArr && includedItemsArr.length > 0)
		cartItemGR.addQuery("sys_id", "IN", includedItemsArr.join(","));
	cartItemGR.query();

	while(cartItemGR.next()) {
		var newCartItemGR = new GlideRecord("sc_cart_item");
		newCartItemGR.initialize();
		newCartItemGR.cart = this.cart.sys_id;
		newCartItemGR.cat_item = cartItemGR.cat_item;
		newCartItemGR.quantity = cartItemGR.quantity;
		var newCartItemID = newCartItemGR.insert();

		//copy the variables for this cart item
		var variableGR = new GlideRecord("sc_item_option");
		variableGR.addQuery("cart_item", cartItemGR.getUniqueValue());
		variableGR.query();

		while(variableGR.next()) {
			var newVariable = new GlideRecord("sc_item_option");
			newVariable.initialize();
			newVariable.cart_item = newCartItemID;
			newVariable.item_option_new = variableGR.item_option_new;
			newVariable.order = variableGR.order;
			newVariable.sc_cat_item_option = variableGR.sc_cat_item_option;
			newVariable.value = variableGR.value;
			newVariable.insert();
		}
	}
};
