gs.include('PrototypeServer');
gs.include('CatalogTransactionCheckout');

var CatalogTransactionClone = Class.create();

CatalogTransactionClone.prototype =  Object.extendsObject(CatalogTransactionCheckout, {

   execute : function() {
       var requestID = this.request.getParameter("requestID");
	   var catalogID = this.request.getParameter("sysparm_catalog");
	   var catalogView = this.request.getParameter("sysparm_catalog_view");
       var map = this.request.getParameterMap();
       var gr = new GlideRecord("sc_request");
       gr.get(requestID);

       var p = new GlideCatalogCloneWorker();
       p.setProgressName("Copying Request: " + gr.number);
       p.setRequest(requestID);
       p.setParameterMap(map);
       p.setBackground(true);
       p.start();

	   var url = GlideappCatalogURLGenerator.getCloneStatusURL(p.getProgressID(), gr.number, gr.sys_id, catalogID, catalogView);
       this.response.sendRedirect(url);
   }
});