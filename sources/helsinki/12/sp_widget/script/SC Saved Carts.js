(function() {
  /* populate the 'data' object */
  /* e.g., data.table = $sp.getValue('table'); */
	var userID = gs.getUser().getID();
	var cart = new SPCart(input.cartName, userID);

	if (input && input.action === "load_cart") {
		// Gotta decide if we want to empty out the users cart or not
		// cart.clearCart();
		cart.loadCart(input.cartID);
	}
	
	if (input && input.action === "remove_cart") {
		var scCartGR = new GlideRecord("sc_cart");
		if (scCartGR.get(input.cartID)) {
			scCartGR.deleteRecord();
		}
	}

	data.savedCarts = [];
	var savedCartsGR = new GlideRecord("sc_cart");
	savedCartsGR.addQuery("user", userID);
	savedCartsGR.addQuery("hidden", false);
	savedCartsGR.addQuery("name", "!=", "DEFAULT");
	savedCartsGR.query();
	
	while(savedCartsGR.next()) {
		data.savedCarts.push({
			name: savedCartsGR.getValue("name"),
			sys_id: savedCartsGR.getUniqueValue()
		});
	}
})();