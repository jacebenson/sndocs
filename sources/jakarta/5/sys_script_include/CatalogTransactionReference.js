gs.include('PrototypeServer');
gs.include('AbstractTransaction');

var CatalogTransactionReference = Class.create();

CatalogTransactionReference.prototype =  Object.extendsObject(AbstractTransaction, {
	
	execute : function() {
		var table = this.request.getParameter('sysparm_table');
		var ref_lookup = this.request.getParameter('sysparm_ref_lookup');
		
		var cart_item = this.request.getParameter('sysparm_cart_id');
		var item_id = this.request.getParameter('sysparm_id');
		var ci = GlideappCatalogItem.get(item_id);
		var cart;
		var cartName = this.request.getParameter("sysparm_cart_name");
		if (!JSUtil.nil(cartName))
			cart = GlideappCart.get(cartName);
		else
			cart = GlideappCart.get();
		if (cart_item)
			cart.updateCart(this.request, cart_item);
		else
			cart_item = cart.addToCart(this.request);
		
		// cart items for record producers shouldn't show up in your (visible) cart
		if ("sc_cat_item_producer".equals(ci.getType())) {
			var gr = GlideRecord.newGlideRecord('sc_cart_item', cart_item);
			if (gr.isValid()) {
				gr.setValue(ACTIVE, false);
				gr.update();
			}
		}
		
		var stack = gs.getSession().getStack();
		if (!stack.isEmpty()) {
			var savedItem = stack.bottom() + "&sysparm_cart_edit=" + cart_item;
			stack.pop();
			stack.push(savedItem);
		}
		
		return table + ".do?sys_id=" + ref_lookup;
	}
});