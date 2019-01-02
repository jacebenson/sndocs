gs.include('PrototypeServer');
gs.include('AbstractTransaction');

var CatalogWizardCheckout = Class.create();

CatalogWizardCheckout.prototype =  Object.extendsObject(CatalogTransactionCheckout, {

   execute : function() {
       var c = new GlideappCart();
       if (!c.getCartItems().hasNext()) {
           gs.addInfoMessage(gs.getMessage("Cannot check out with an empty cart!"));
           return gs.getSession().getStack().purge("com.glideapp.servicecatalog");
       }   

       return this._checkout();
   }
}); 