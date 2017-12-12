var ServiceCatalogProcessor = Class.create();

ServiceCatalogProcessor.prototype =  Object.extendsObject(AbstractScriptProcessor, {
	process : function() {
		var t = this._getTransaction();
		if (t != null) {
			var url = t.execute();
			if (url) {
				var view = this.request.getParameter('sysparm_view');
				if (view)
					url = GlideURLUtil.addURLParm(url, 'sysparm_view=' + view);
				this.response.sendRedirect(url);
			}
			
			return;
		}
		
		gs.addErrorMessage(gs.getMessage('An unexpected error occurred, please try again.'));
		this.response.sendRedirect('home.do');
	},
	
	_xssFilter : function(taintedStr) {
		var re = /^[-_0-9A-Za-z]*$/g;
		var validStr = taintedStr.match(re);
		if (JSUtil.nil(validStr))
			taintedStr = "XSS-Attempt-FOILED";
		return taintedStr;
	},
	
	_getTransaction : function() {
		if (this.action == 'sysverb_back')
			return new CatalogTransactionBack(this.request, this.response, this.processor);
		if (this.action == 'cart_remove')
			return new CatalogTransactionRemove(this.request, this.response, this.processor);
		if (this.action == 'update')
			return new CatalogTransactionUpdateCart(this.request, this.response, this.processor);
		if (this.action == 'checkout')
			return new CatalogTransactionCheckout(this.request, this.response, this.processor);
		if (this.action == 'checkouttwo')
			return new CatalogTransactionCheckoutTwo(this.request, this.response, this.processor);
		if (this.action == 'order')
			return new CatalogTransactionOrder(this.request, this.response, this.processor);
		if (this.action == 'update_proceed')
			return new CatalogTransactionUpdateProceed(this.request, this.response, this.processor);
		if (this.action == 'request_cancel')
			return new CatalogTransactionCancel(this.request, this.response, this.processor);
		if (this.action == 'request_clone')
			return new CatalogTransactionClone(this.request, this.response, this.processor);
		if (this.action == 'continue_shopping')
			return new CatalogTransactionContinue(this.request, this.response, this.processor);
		if (this.action == 'popup')
			return new CatalogTransactionPopup(this.request, this.response, this.processor);
		if (this.action == 'popupCat')
			return new CatalogTransactionPopupCategory(this.request, this.response, this.processor);
		if (this.action == 'restart_guide')
			return new CatalogTransactionRestartGuide(this.request, this.response, this.processor);
		if (this.action == 'next_guide')
			return new CatalogTransactionNextGuide(this.request, this.response, this.processor);
		if (this.action == 'previous_guide')
			return new CatalogTransactionPreviousGuide(this.request, this.response, this.processor);
		if (this.action == 'nav_guide')
			return new CatalogTransactionNavigateGuide(this.request, this.response, this.processor);
		if (this.action == 'init_guide')
			return new CatalogTransactionInitGuide(this.request, this.response, this.processor);
		if (this.action == 'add_attachment')
			return new CatalogTransactionAttachment(this.request, this.response, this.processor);
		if (this.action == 'veto')
			return new CatalogTransactionLineItemVeto(this.request, this.response, this.processor);
		if (this.action == 'show_reference')
			return new CatalogTransactionReference(this.request, this.response, this.processor);
		
		return null;
	}
});