gs.include("PrototypeServer");

var CatalogTransactionUpdateProceed = Class.create();

CatalogTransactionUpdateProceed.prototype = {
	
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
		var cart_item = this.request.getParameter('sysparm_cart_id');
		cart.updateCart(this.request, cart_item);
		return new CatalogTransactionCheckout(this.request, this.response).execute();
	}
};