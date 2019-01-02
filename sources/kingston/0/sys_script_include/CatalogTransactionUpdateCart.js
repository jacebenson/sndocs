gs.include('PrototypeServer');
gs.include('AbstractTransaction');

var CatalogTransactionUpdateCart = Class.create();

CatalogTransactionUpdateCart.prototype =  Object.extendsObject(AbstractTransaction, {
	
	execute : function() {
		var cart_item = this.request.getParameter('sysparm_cart_id');
		var cart;
		var cartName = this.request.getParameter("sysparm_cart_name");
		if(JSUtil.nil(cartName) && !JSUtil.nil(cart_item)) {
			//Because many times we only send CartItem id but not CartName
			var gr = new GlideRecord('sc_cart_item');
			if (gr.get(cart_item))
				cartName = '' + gr.cart.name;
			else
				cartName = '';
		} 
		if (!JSUtil.nil(cartName))
			cart = GlideappCart.get(cartName);
		else
			cart = GlideappCart.get();
		cart.updateCart(this.request, cart_item);
		//for new order now, an entry was inserted in default cart, on editing the item from order now specific cart, that entry needs to be edited in default cart as well
		var isNewOrderNow = '' + gs.getProperty("glide.sc.enable_order_now", "false");
		if(isNewOrderNow == 'true' && !JSUtil.nil(cartName) && cartName.startsWith('cart_')) {
			var itemId = gs.getSession().getProperty('default_cart_item');
			if (!JSUtil.nil(itemId)){
				cart = GlideappCart.get();
				cart.updateCart(this.request,itemId);
			}
		}
		var stack = gs.getSession().getStack();
		if (stack.size() ==1 )
			return stack.pop();
		
		return stack.back();
	}
});