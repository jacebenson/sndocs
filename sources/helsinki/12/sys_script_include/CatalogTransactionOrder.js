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
		cart.addToCart(this.request);
		return new CatalogTransactionCheckout(this.request, this.response).execute();
	}
};