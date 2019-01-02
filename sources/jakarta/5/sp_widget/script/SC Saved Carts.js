(function() {
  /* populate the 'data' object */
  /* e.g., data.table = $sp.getValue('table'); */
	data.msgs = {};
	data.msgs.deleteBundleConfirmation = gs.getMessage("Are you sure you want to delete this bundle?");
	data.msgs.bundleLoadedMsg = gs.getMessage("The bundle has replaced the contents of your cart.")
	data.msgs.bundleRemovedMsg = gs.getMessage("has been removed from your bundles");
	data.msgs.bundleAddedMsg = gs.getMessage("Bundle has been added to your cart.")

	var userID = gs.getUser().getID();
	var cart = new SPCart(input.cartName, userID);

	data.cartCount = cart.getItems().length;

	if (input && input.action === "retrieve_bundle_items") {
		var bundle = new SPCart(input.cartName, userID);
		data.bundleItems = bundle.getItems();
		return;
	}

	if (input && input.action === "load_cart") {
		cart.loadCart(input.cartID);
	}

	if (input && input.action === "replace_cart") {
		cart.clearCart();
		cart.loadCart(input.cartID);
	}

	if (input && input.action === "remove_bundle") {
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