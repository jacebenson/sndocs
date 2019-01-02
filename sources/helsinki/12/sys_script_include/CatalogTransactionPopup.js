gs.include('PrototypeServer');
gs.include('AbstractTransaction');

var CatalogTransactionPopup = Class.create();

CatalogTransactionPopup.prototype =  Object.extendsObject(AbstractTransaction, {

   execute : function() {
       var sys_id = g_request.getParameter("sysparm_sys_id");
       var p = new GlideappCatItemPopper();	
       var s = p.renderPopup(this.processor.getController(), sys_id);
       this.processor.writeOutput(s);
   }
});