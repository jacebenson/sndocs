gs.include('PrototypeServer');
gs.include('AbstractTransaction');

var CatalogTransactionAttachment = Class.create();

CatalogTransactionAttachment.prototype =  Object.extendsObject(AbstractTransaction, {
	execute : function() {
		var cart_item = this.request.getParameter('sysparm_cart_id');
		var item_id = this.request.getParameter('sysparm_id');
		var ci = GlideappCatalogItem.get(item_id);
		var cartName = this.request.getParameter("sysparm_cart_name");
		var cart;
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
		var refer = GlideappCatalogURLGenerator.getItemEditURL(item_id, cart_item);
		var wrapped = GlideStringUtil.urlWrap(refer);
		return "attachment.do?sysparm_stack=no&sysparm_table=sc_cart_item&sysparm_sys_id=" + cart_item + "&sysparm_refer=" + wrapped;
	}
});