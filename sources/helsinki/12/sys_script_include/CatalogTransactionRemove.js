gs.include('PrototypeServer');
gs.include('AbstractTransaction');

var CatalogTransactionRemove = Class.create();

CatalogTransactionRemove.prototype =  Object.extendsObject(AbstractTransaction, {
	
	execute : function() {
		var cart;
		var cartName = this.request.getParameter("sysparm_cart_name");
		if (!JSUtil.nil(cartName))
			cart = GlideappCart.get(cartName);
		else
			cart = GlideappCart.get();
		var id = this.request.getParameter('sysparm_id');
		cart.remove(id);
		//for new order now, an entry was inserted in default cart, on deletion of the item from order now specific cart, that entry needs to be deleted from default cart as well
		var isNewOrderNow = '' + gs.getProperty("glide.sc.enable_order_now", "false");
		if(isNewOrderNow == 'true' && !JSUtil.nil(cartName)) {
			var default_cart_item_id = gs.getSession().getProperty('default_cart_item');
			if (!JSUtil.nil(default_cart_item_id) && cartName.startsWith('cart_')){
				cart = GlideappCart.get();
				cart.remove(default_cart_item_id);
				gs.getSession().clearProperty('default_cart_item');
			}
		}
			
		var url = this.request.getParameter("url");
		if (!JSUtil.nil(url))
			return url;
		else
			return gs.getSession().getStack().pop();
	}
});