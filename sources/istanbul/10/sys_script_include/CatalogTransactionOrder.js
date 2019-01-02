gs.include("PrototypeServer");

var CatalogTransactionOrder = Class.create();

CatalogTransactionOrder.prototype = {
	
	initialize : function(request, response) {
		this.request = request;
		this.response = response;
	},
	
	execute : function() {
		var cart;
		var cartName = this.request.getParameter("sysparm_cart_name");
		if (!JSUtil.nil(cartName))
			cart = GlideappCart.get(cartName);
		else
			cart = GlideappCart.get();
		var wishListItemId = this.request.getParameter("sysparm_wish_list_item_id") || '';
		wishListItemId = '' + wishListItemId;

		var cartItemId = cart.addToCart(this.request);
		
		if (cartItemId && wishListItemId)
			this.removeWishListItem(cartItemId, wishListItemId);
		return new CatalogTransactionCheckout(this.request, this.response).execute();
	},

	removeWishListItem : function(cartItemId, wishListItemId) {
		var savedItemCart = GlideappCart.get("saved_items");
		GlideSysAttachment.copy("sc_cart_item", wishListItemId, "sc_cart_item", cartItemId);
		savedItemCart.remove(wishListItemId);
	},
};