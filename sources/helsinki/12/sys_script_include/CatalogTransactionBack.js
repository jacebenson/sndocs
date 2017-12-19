gs.include('PrototypeServer');
gs.include('AbstractTransaction');

var CatalogTransactionBack = Class.create();

CatalogTransactionBack.prototype = Object.extendsObject(AbstractTransaction, {

	execute: function() {
		var urlStack = j2js(gs.getSession().getStack());
		var urlStackSize = urlStack.size();
		var guideParam = j2js(this.request.getParameter('sysparm_guide'));


		if (urlStackSize === 0 && !JSUtil.nil(guideParam)) {

			/****************************************************************************
			 *Case - This is the first page in iFrame or direct hit from external URL
			 *and session started from order guide so default to order guide describe
			 *needs page
			 ****************************************************************************/
			return GlideappCatalogURLGenerator.getItemBaseURL(guideParam);

		} else if (urlStackSize === 1) {

			//Case - Session stack is as expected . Do not pop from stack if this is the last page.  
			return urlStack.top();

		} else {

			//Case - Session stack is as expected . Pop to last page.
			return urlStack.back();

		}
	}
});