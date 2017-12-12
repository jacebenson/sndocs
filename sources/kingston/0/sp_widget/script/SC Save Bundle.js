(function() {
	data.bundleSaveSuccessMsg = gs.getMessage("Bundle has been successfully created");
	
	var userID = gs.getUser().getID();
	var cart = new SPCart("DEFAULT", userID);

	if (input) {
		//Check to make sure no carts with this name already exist
		var cartGR = new GlideRecord("sc_cart");
		cartGR.addQuery("user", userID);
		cartGR.addQuery("name", input.newCartName);
		cartGR.query();
		if (cartGR.next()) {
			data.error = gs.getMessage("A bundle of that name already exists - please select another.");
			data.cartItems = input.cartItems;
			return;
		}

		var includedItemsArr = input.cartItems.filter(function(item) {
			return item.selected;
		}).map(function(item) {
			return item.sys_id;
		});

		var newCart = new SPCart(input.newCartName, userID);
		newCart.setHidden(false);
		newCart.loadCart(cart.getCartID(), includedItemsArr);
		return;
	}

	data.cartItems = cart.getItems();
	data.cartItems.map(function(item) {
		item.selected = true;
	});
})();