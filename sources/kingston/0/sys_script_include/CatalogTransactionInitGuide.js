gs.include('PrototypeServer');
gs.include('AbstractTransaction');

var CatalogTransactionInitGuide = Class.create();

CatalogTransactionInitGuide.prototype =  Object.extendsObject(AbstractTransaction, {
	
	execute : function() {
		var cartName = this.request.getParameter("sysparm_cart_name");
		var cart;
		if (!JSUtil.nil(cartName))
			cart = GlideappCart.get(cartName);
		else
			cart = GlideappCart.get();
		var og = new GlideappOrderGuide(cart.getGuide());
		og.init(this.request, this.response);
	}
});