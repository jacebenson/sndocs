gs.include('PrototypeServer');
gs.include('AbstractTransaction');

var CatalogTransactionNextGuide = Class.create();

CatalogTransactionNextGuide.prototype =  Object.extendsObject(AbstractTransaction, {
	
	execute : function() {
		var cartName = this.request.getParameter("sysparm_cart_name");
		var cart;
		if (!JSUtil.nil(cartName))
			cart = GlideappCart.get(cartName);
		else
			cart = GlideappCart.get();
		var og = new GlideappOrderGuide(cart.getGuide());
		og.next(this.request, this.response, cart);
	}
});