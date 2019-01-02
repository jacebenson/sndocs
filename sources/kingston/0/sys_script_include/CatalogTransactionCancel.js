gs.include('PrototypeServer');
gs.include('AbstractTransaction');

var CatalogTransactionCancel = Class.create();

CatalogTransactionCancel.prototype =  Object.extendsObject(AbstractTransaction, {
	
	execute : function() {
		var id = this.request.getParameter('sysparm_id');
		gs.print('ID = ' + id);
		var request = new GlideRecord("sc_request");
		request.addQuery('sys_id', id);
		request.query();
		if (request.next()) {
			request.setValue("request_state", "closed_cancelled");
			request.update();
			gs.getSession().addInfoMessage(gs.getMessage("Request {0} has been cancelled", request.number));
			gs.getSession().get().getStack().pop();
			var catalogId = this.request.getParameter("sysparm_catalog");
			var catalogView = this.request.getParameter("sysparm_catalog_view");
			return GlideappCatalogURLGenerator.getContinueShoppingUrl(catalogId, catalogView);
		}
		gs.addErrorMessage(gs.getMessage("Could not cancel request as it could not be located"));
		return "home.do";
	}
});