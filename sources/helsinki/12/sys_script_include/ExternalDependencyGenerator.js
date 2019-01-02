gs.include("PrototypeServer");

var ExternalDependencyGenerator = Class.create();

ExternalDependencyGenerator.prototype = {

   initialize : function(/* GlideRecord */ request) {
     this.request = request;
     this._lazy = false;
   },

   setRequest : function(/* GlideRecord */ request) {
     this.request = request;
   },

   setLazy : function(/* boolean */ lazy) {
     this._lazy = lazy;
   },

   generate : function() {
     var gr = new GlideRecord('sc_req_item');
     gr.addQuery('request', this.request.sys_id);
     gr.query();
     while (gr.next()) {
 
        // using workflow for this item?
        if (gr.cat_item.workflow != null && !gr.cat_item.workflow.nil())
           continue;
            
        var planID = GlideappDeliveryPlan.resolvePlanID(gr);
        var plan = GlideappDeliveryPlan.get(planID);
        if (!plan)
           continue;

        var it = plan.getTokenMap().values().iterator();
        while (it.hasNext()) {
           var tt = it.next();
           this._createDependencies(tt, gr);
        }
     }
   },

   _createDependencies: function(/* TaskToken **/ tt, /* GlideRecord */ request_item) {
     if (tt.getExternalPredecessors().isEmpty())
       return;


     var actualTask = new GlideRecord('sc_task');
     actualTask.addQuery('delivery_task', tt.getId());
     actualTask.addQuery('request_item', request_item.sys_id);
     actualTask.query();
     if (!actualTask.next())
        return;

     var it = tt.getExternalPredecessors().iterator();
     while (it.hasNext()) {
       var task_id = it.next();
       var gr = new GlideRecord('sc_task');
       gr.addQuery('delivery_task', task_id);
       gr.addQuery('request_item.request', this.request.sys_id);
       gr.query();
       while (gr.next()) {
         var dep = new GlideRecord('execution_plan_local');
         dep.initialize();
         dep.predecessor = gr.sys_id;
         dep.successor = actualTask.sys_id;
         if (this._lazy)
            dep.insertLazy();
         else
            dep.insert();
       }
     }
   }
}