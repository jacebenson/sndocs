gs.include('PrototypeServer');
gs.include('AbstractTransaction');

var CatalogTransactionRestartGuide = Class.create();

CatalogTransactionRestartGuide.prototype =  Object.extendsObject(AbstractTransaction, {
	
	execute : function() {
		var cart;
		var cartName = this.request.getParameter("sysparm_cart_name");
		if (!JSUtil.nil(cartName))
			cart = GlideappCart.get(cartName);
		else
			cart = GlideappCart.get();
		var og = new GlideappOrderGuide(cart.getGuide());
		og.restart(this.request, this.response, cart);
	}
});