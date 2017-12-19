gs.include('PrototypeServer');
gs.include('AbstractTransaction');

var CatalogTransactionCheckout = Class.create();

CatalogTransactionCheckout.prototype =  Object.extendsObject(AbstractTransaction, {
	
	execute : function() {
		var catalog = this.request.getParameter("sysparm_catalog");
		var catalogView = this.request.getParameter("sysparm_catalog_view");
		var cartName = this.request.getParameter("sysparm_cart_name");
		var cart;
		if (!JSUtil.nil(cartName))
			cart = GlideappCart.get(cartName);
		else
			cart = GlideappCart.get();
		if (!cart.getCartItems().hasNext()) {
			gs.addInfoMessage(gs.getMessage("Cannot check out with an empty cart!"));
			return gs.getSession().getStack().purge("com.glideapp.servicecatalog");
		}
		var twoStep = gs.getProperty("glide.sc.checkout.twostep", "false");
		if (twoStep == 'true')
			if (!JSUtil.nil(cartName))
				return SNC.CatalogURLGenerator.getRedirectPreviewOrder(catalog, catalogView, cartName);
			else
				return GlideappCatalogURLGenerator.getRedirectOneStageCheckout(catalog, catalogView);
		return this._checkout(catalog, catalogView, cartName);
	},
	
	_checkout : function(catalog, catalogView, cartName) {
		var view = this.request.getParameter("sysparm_view");
		if (!view)
			view = "ess";
		var req = new GlideappRequestNew();
		
		var requestRecord;
		var cart;
		if (!JSUtil.nil(cartName)) {
			requestRecord = req.copyCart(cartName);
			cart = GlideappCart.get(cartName);
		}
		else {
			requestRecord = req.copyCart();
			cart = GlideappCart.get();
		}
		var isNewOrderNow = gs.getProperty("glide.sc.enable_order_now", "false");
		if(isNewOrderNow == 'true' && !JSUtil.nil(cartName) && cartName.startsWith('cart_')){
			var id = gs.getSession().getProperty("default_cart_item");
			
			//for new order now, an entry was inserted in default cart, on successful checkout, that entry needs to be deleted
			if (!JSUtil.nil(id)) {
				var def_cart;
				def_cart = GlideappCart.get();
				def_cart.remove(id);
				gs.getSession().clearProperty("default_cart_item");
			}
		}
		cart.empty();
		return this._checkoutRedirect(view, catalog, catalogView, requestRecord);
	},
	
	_checkoutRedirect : function(view, catalog, catalogView, requestRecord) {
		// If an alternative redirect was specified, use it!
		var altRedirect = this.request.getParameter("sysparm_redirect");
		if (!gs.nil(altRedirect)) {
			gs.addInfoMessage(gs.getMessage('Your request has been placed: {0}', '<a href="' + requestRecord.getLink() + '">' + requestRecord.number + '</a>'));
			return altRedirect;
		}
		var checkoutForm = gs.getProperty("glide.sc.checkout.form", "com.glideapp.servicecatalog_checkout_view");
		if (!checkoutForm) {
			gs.addErrorMessage(gs.getMessage("Invalid or empty checkout form specified in property : glide.sc.checkout.form"));
			return "home.do";
		}
		if (!view)
			view = "";
		answer = GlideappCatalogURLGenerator.getCheckoutURLForPage(checkoutForm, requestRecord.sys_id, view, catalog, catalogView);
		return answer;
	}
});