(function() {
	var m = data.msgs = {};
	m.itemRemovedMsg = gs.getMessage("has been removed from your Wish List");
	m.removeItemConfirmationMsg = gs.getMessage("Are you sure you want to remove this item from Wish List?");
	m.removeEditingItemMsg = gs.getMessage("Are you sure you want to remove the item you are viewing from your Wish List?");
	m.clearWishlistConfirmationMsg = gs.getMessage("Are you sure you want to empty your Wish List?");
	var cart = new SPCart("saved_items", gs.getUser().getID());

	if (input && input.action === "clear_cart")
		cart.clearCart();

	if (input && input.action === "remove_item") {
		var itemGR = new GlideRecord('sc_cart_item');
		if (itemGR.get(input.removeItemID))
			itemGR.deleteRecord();
	}

	data.cartItems = cart.getItems();
	$sp.logStat('Wishlist View', 'sc_cart', '', 'saved_items');
})();