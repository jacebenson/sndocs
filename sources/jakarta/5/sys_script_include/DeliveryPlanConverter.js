gs.include('PrototypeServer');
gs.include('DeliveryPlanTaskGenerator');
gs.include('ExternalDependencyGenerator');

var DeliveryPlanConverter = Class.create();

DeliveryPlanConverter.prototype = {
 
     initialize : function () {
        this.sourceTable = 'sc_req_item';
     },

     convert : function() {
        gs.getSession().setIRDisabled(true);
        this.setRequestItemParents();
        this.convertDefault();
        this.convertExternal();
        gs.getSession().setIRDisabled(false);
     },

     setRequestItemParents : function() {
        gs.print('Setting parent field on request items');
        GlideDBUtil.copyFromOldToNew('parent', 'sc_req_item', 'task', 'request');
        gs.print('Parent field set complete');
     },

     convertExternal : function() {
        if (this.sourceTable != 'sc_req_item')
           return;

        gs.print('Beginning conversion of external dependencies');
        var gr = new GlideRecord('sc_request');
        gr.query();
        var count = 0;
        var max = gr.getRowCount();
        var gen = new ExternalDependencyGenerator();
        gen.setLazy(true);
        while (gr.next()) {
           gen.setRequest(gr);
           gen.generate();
           count++;
           if (count % 100 == 0)
             gs.print('Converted ' + count + ' of ' + max + ' external dependencies');
        }  
        gs.print('Completed conversion of external dependencies');      
     },

     convertDefault : function() {
        gs.print('Beginning delivery plan conversion for ' + this.sourceTable);
        var gr = new GlideRecord(this.sourceTable);
        gr.query();
        var count = 0;
        var max = gr.getRowCount();
        while (gr.next()) {
           count++;
           var planID = GlideappDeliveryPlan.resolvePlanID(gr);
           if (!planID)
             continue;
        
           var plan = GlideappDeliveryPlan.get(planID);
           if (!plan)
             continue;
          
           var gen = new DeliveryPlanTaskGenerator(plan, gr);
           gen.setLazy(true);
           gen.convertTasks();
           if (count % 100 == 0)
              gs.print('Converted ' + count + ' of ' + max + ' delivery plans');

        }
        gs.print('Completed delivery plan conversion');
     }
}