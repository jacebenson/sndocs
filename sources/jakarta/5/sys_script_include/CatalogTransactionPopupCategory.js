gs.include('PrototypeServer');
gs.include('AbstractTransaction');

var CatalogTransactionPopupCategory = Class.create();

CatalogTransactionPopupCategory.prototype =  Object.extendsObject(AbstractTransaction, {

   execute : function() {
       var sys_id = g_request.getParameter("sysparm_sys_id");
       var p = new GlideappCategoryPopper();	
       var s = p.renderPopup(this.processor.getController(), sys_id);
       this.processor.writeOutput(s);
   }
});