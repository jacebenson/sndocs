gs.include("PrototypeServer");

var DeliveryTask = Class.create();

DeliveryTask.prototype = {
    initialize : function() {
		
    },

    getReferenceQual : function() {
        var delivery_plan = current.delivery_plan;
        gs.print('DELIVERY PLAN = ' + delivery_plan);
        var answer = 'sys_id!=' + current.sys_id;
        if (delivery_plan) {
            return answer + '^delivery_plan=' + delivery_plan;
        }
        return '';
    },
    
    getLocalReferenceQual : function() {
       var parent_id = current.parent;
       var answer = 'parent=' + parent_id;
       return answer;
    }
};
