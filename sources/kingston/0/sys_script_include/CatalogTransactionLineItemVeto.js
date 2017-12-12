gs.include('PrototypeServer');
gs.include('AbstractTransaction');

var CatalogTransactionLineItemVeto = Class.create();

CatalogTransactionLineItemVeto.prototype =  Object.extendsObject(AbstractTransaction, {

   execute : function() {
       var id = this.request.getParameter('sysparm_id');
       var status = this.request.getParameter('sysparm_state');
	   var stackID = this.request.getParameter('sysparm_nameofstack');

       var gr = new GlideRecord("sc_req_item");
       gr.addQuery('sys_id', id);
       gr.query();
       if (gr.next()) {
           if (status == 'reject')
              this._veto(gr);
           else
              this._accept(gr);

           new GlideappCalculationHelper().rebalanceRequest(gr.request);
		   var stack;
		   if (stackID && stackID != null && stackID != '')
			  stack = gs.getSession().get().getStack(stackID);
           else
			  stack = gs.getSession().get().getStack();
           if (!stack.isEmpty())
              return stack.pop();
 		  else
			  return "home.do";
       }
       gs.addErrorMessage(gs.getMessage("Could not cancel request item as it could not be located"));
       return "home.do";
   },

   _veto : function(gr) {
       gr.setValue("stage", "Request Cancelled");
       gr.setValue("approval", 'rejected');
       gr.setValue("state", 4);
       gr.update();
       gs.getSession().addInfoMessage(gs.getMessage("Request Item {0} has been cancelled", gr.number));
   },

   _accept : function(gr) {
       gr.setValue("stage", "waiting_for_approval");
       gr.setValue("approval", "requested");
       gr.update();
       gs.getSession().addInfoMessage(gs.getMessage("Request Item {0} has been accepted", gr.number));
   }
});